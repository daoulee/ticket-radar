import copy
import json
from pathlib import Path
import unittest

from check_api import ReviewError, validate_check


class ResponseReviewTests(unittest.TestCase):
    def setUp(self):
        self.response = json.loads(Path(__file__).with_name("demo-check.json").read_text())

    def test_valid_synthetic_price(self):
        validate_check(self.response, {"facePrice": 100000, "salePrice": 150000})

    def test_held_comparison_without_fake_numbers(self):
        self.response["priceComparison"] = {"held": True, "reason": "회차 불일치"}
        validate_check(self.response, {"held": True})

    def test_negative_price_difference_is_allowed(self):
        self.response["priceComparison"] = {"diff": -10000, "ratePercent": -10}
        validate_check(self.response, {"facePrice": 100000, "salePrice": 90000})

    def test_reject_misleading_demo_flag(self):
        self.response["isDemo"] = False
        with self.assertRaises(ReviewError):
            validate_check(self.response)

    def test_reject_wrong_price_calculation(self):
        self.response["priceComparison"]["ratePercent"] = 150
        with self.assertRaises(ReviewError):
            validate_check(self.response, {"facePrice": 100000, "salePrice": 150000})

    def test_reject_nan_and_boolean_prices(self):
        for bad in [float("nan"), float("inf"), True]:
            with self.subTest(bad=bad):
                self.response["priceComparison"]["diff"] = bad
                with self.assertRaises(ReviewError):
                    validate_check(self.response)

    def test_reject_numbers_when_comparison_is_held(self):
        self.response["priceComparison"]["held"] = True
        self.response["priceComparison"]["reason"] = "회차 불일치"
        with self.assertRaises(ReviewError):
            validate_check(self.response)

    def test_reject_held_result_without_reason(self):
        self.response["priceComparison"] = {"held": True}
        with self.assertRaises(ReviewError):
            validate_check(self.response)

    def test_reject_missing_or_invalid_official_evidence(self):
        for field, bad in [("sourceUrl", "javascript:alert(1)"), ("sourceUrl", "https://user:password@example.invalid"), ("officialExcerpt", ""), ("checkedAt", None), ("listingQuote", "")]:
            response = copy.deepcopy(self.response)
            response["findings"][0][field] = bad
            with self.subTest(field=field, bad=bad), self.assertRaises(ReviewError):
                validate_check(response)

    def test_reject_unknown_candidate_with_invented_value(self):
        self.response["extracted"]["deliveryMethod"]["value"] = "QR"
        with self.assertRaises(ReviewError):
            validate_check(self.response)

    def test_unknown_candidate_may_have_null_quote(self):
        self.response["extracted"]["deliveryMethod"]["evidenceQuote"] = None
        validate_check(self.response)

    def test_found_candidate_requires_quote(self):
        self.response["extracted"]["price"]["evidenceQuote"] = None
        with self.assertRaises(ReviewError):
            validate_check(self.response)

    def test_needs_check_with_listing_quote_without_official_rule(self):
        self.response["findings"] = [{
            "type": "prepayment",
            "status": "needs_check",
            "listingQuote": "입금 먼저",
            "officialExcerpt": None,
            "sourceUrl": None,
            "checkedAt": None,
            "reason": "전달 시점과 환불 조건을 확인하세요.",
        }]
        validate_check(self.response)

    def test_needs_check_rejects_missing_listing_quote(self):
        self.response["findings"] = [{
            "type": "prepayment",
            "status": "needs_check",
            "listingQuote": None,
            "officialExcerpt": None,
            "sourceUrl": None,
            "checkedAt": None,
            "reason": "전달 시점과 환불 조건을 확인하세요.",
        }]
        with self.assertRaises(ReviewError):
            validate_check(self.response)

    def test_reject_zero_reference_price_in_expected_case(self):
        with self.assertRaises(ReviewError):
            validate_check(self.response, {"facePrice": 0, "salePrice": 150000})

    def test_expected_held_case_cannot_return_numeric_result(self):
        with self.assertRaises(ReviewError):
            validate_check(self.response, {"held": True})


if __name__ == "__main__":
    unittest.main()
