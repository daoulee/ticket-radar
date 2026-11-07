import { FIELD_KEYS, type ListingFields } from '../contract/types'

// 사용자 확인값의 초기 상태. 모든 조건은 null(확인 안 됨)에서 시작하고 자동으로 채우지 않는다.
export const EMPTY_FIELDS: ListingFields = Object.fromEntries(FIELD_KEYS.map((k) => [k, null])) as ListingFields

export function sameListingFields(a: ListingFields, b: ListingFields) {
  return FIELD_KEYS.every((key) => a[key] === b[key])
}
