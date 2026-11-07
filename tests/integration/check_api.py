"""Astra's provisional API review checks; not the server's contract schema.

No third-party dependencies. Error messages contain field paths, not listing text.
"""
import argparse
import json
import math
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen


class ReviewError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise ReviewError(message)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def source_url(value):
    if not nonempty(value):
        return False
    try:
        url = urlsplit(value)
        return url.scheme in ("https", "http") and bool(url.hostname) and not url.username and not url.password
    except ValueError:
        return False


def validate_check(response, expected=None):
    """Validate WEB-001's proposed response and optional hand-verified prices.

    expected contains facePrice/salePrice only when event, showtime, seat,
    quantity and fee conditions have been checked outside this validator.
    This function does not infer identity, price eligibility or fraud.
    """
    require(isinstance(response, dict), "response must be an object")
    require(type(response.get("isDemo")) is bool, "isDemo must be boolean")
    require(response.get("dataMode") in ("demo", "live"), "dataMode must be demo or live")
    # A demo flag may remain true for synthetic listings over live official data.
    require(response["dataMode"] != "demo" or response["isDemo"], "demo data must have isDemo=true")
    extracted = response.get("extracted")
    require(isinstance(extracted, dict) and bool(extracted), "extracted must contain candidate fields")
    for field, candidate in extracted.items():
        require(isinstance(candidate, dict), f"extracted.{field} must be an object")
        require("value" in candidate, f"extracted.{field}.value must be explicit, including null")
        require(candidate.get("status") in ("extracted", "ambiguous", "unknown"), f"extracted.{field}.status is outside the draft")
        require("evidenceQuote" in candidate, f"extracted.{field}.evidenceQuote must be explicit, including null")
        quote = candidate["evidenceQuote"]
        require(quote is None or isinstance(quote, str), f"extracted.{field}.evidenceQuote must be text or null")
        if candidate["status"] in ("extracted", "ambiguous"):
            require(nonempty(quote), f"extracted.{field}: found candidate needs a listing quote")
        if candidate["status"] == "unknown":
            require(candidate["value"] is None, f"extracted.{field}: unknown must have value=null")
    findings = response.get("findings")
    require(isinstance(findings, list), "findings must be an array")
    for index, finding in enumerate(findings):
        path = f"findings[{index}]"
        require(isinstance(finding, dict), f"{path} must be an object")
        require(finding.get("type") in ("price", "policy", "prepayment"), f"{path}.type is outside the draft")
        require(finding.get("status") in ("matched", "conflict", "needs_check", "unverifiable", "comparison_held"), f"{path}.status is outside the draft")
        require(nonempty(finding.get("reason")), f"{path}.reason is required")
        if finding["status"] in ("unverifiable", "comparison_held"):
            continue
        require(nonempty(finding.get("listingQuote")), f"{path}.listingQuote is required")
        if finding["type"] in ("price", "policy") and finding["status"] in ("matched", "conflict"):
            require(nonempty(finding.get("officialExcerpt")), f"{path}.officialExcerpt is required")
            require(source_url(finding.get("sourceUrl")), f"{path}.sourceUrl must be an HTTP(S) source")
            require(nonempty(finding.get("checkedAt")), f"{path}.checkedAt is required")
        if finding["status"] == "needs_check" and finding.get("officialExcerpt") is not None:
            require(nonempty(finding["officialExcerpt"]), f"{path}.officialExcerpt must be nonempty when provided")
            require(source_url(finding.get("sourceUrl")), f"{path}.sourceUrl must be an HTTP(S) source")
            require(nonempty(finding.get("checkedAt")), f"{path}.checkedAt is required with official evidence")
    comparison = response.get("priceComparison")
    require(isinstance(comparison, dict), "priceComparison must be an object")
    if comparison.get("held") is True:
        require(nonempty(comparison.get("reason")), "held price comparison must explain why")
        require("diff" not in comparison and "ratePercent" not in comparison, "held comparison must not expose numeric results")
    else:
        require("held" not in comparison or comparison["held"] is False, "held must be boolean when present")
        require(number(comparison.get("diff")), "priceComparison.diff must be finite")
        require(number(comparison.get("ratePercent")), "priceComparison.ratePercent must be finite")
    if expected is not None:
        require(isinstance(expected, dict), "expected must be an object")
        if expected.get("held") is True:
            require(comparison.get("held") is True, "this scenario must withhold comparison")
        else:
            face, sale = expected.get("facePrice"), expected.get("salePrice")
            require(number(face) and face > 0 and number(sale) and sale >= 0, "expected prices require positive face price and nonnegative sale price")
            require(comparison.get("held") is not True, "this verified scenario should have a numeric comparison")
            require(math.isclose(comparison["diff"], sale - face, abs_tol=0.005), "price difference does not match the reviewed scenario")
            require(math.isclose(comparison["ratePercent"], (sale / face - 1) * 100, abs_tol=0.01), "price percentage does not match the reviewed scenario")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--response", type=Path, help="Saved JSON response to review")
    parser.add_argument("--expected", type=Path, help="Optional hand-verified expected-price JSON")
    source.add_argument("--base-url", help="POST request JSON to this server's /checks")
    parser.add_argument("--request", type=Path, help="Request body for live HTTP validation")
    args = parser.parse_args()
    require(not args.base_url or args.request is not None, "--base-url requires --request")
    require(args.request is None or args.base_url is not None, "--request requires --base-url")
    if args.base_url:
        require(source_url(args.base_url), "base URL must be HTTP(S) without credentials")
        url = urlsplit(args.base_url)
        require(not url.query and not url.fragment, "base URL must not contain query or fragment")
        payload = json.loads(args.request.read_text(encoding="utf-8"))
        request = Request(args.base_url.rstrip("/") + "/checks", data=json.dumps(payload, allow_nan=False).encode(), headers={"Content-Type": "application/json"}, method="POST")
        # A bounded request; never print listing text, API credentials or response bodies.
        with urlopen(request, timeout=10) as result:
            raw = result.read(1_048_577)
        require(len(raw) <= 1_048_576, "response exceeds 1 MiB")
        response = json.loads(raw)
    else:
        response = json.loads(args.response.read_text(encoding="utf-8"))
    expected = json.loads(args.expected.read_text(encoding="utf-8")) if args.expected else None
    validate_check(response, expected)
    print("PASS: response review checks (provisional WEB-001 draft)")
    print("Source: HTTP /checks" if args.base_url else "Source: saved JSON; no API call performed")


if __name__ == "__main__":
    try:
        main()
    except (ReviewError, OSError, ValueError, HTTPError, URLError) as error:
        # HTTP exceptions can contain URLs; report only the class for IO failures.
        print("FAIL:", str(error) if isinstance(error, ReviewError) else type(error).__name__)
        raise SystemExit(1)
