import { useLayoutEffect, useRef, type InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'min' | 'max'> & {
  value: string
  onValueChange: (digits: string) => void
  minAmount?: number
  maxAmount?: number
}

const formatDigits = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const positionAfterDigits = (text: string, count: number) => {
  if (count === 0) return 0
  let seen = 0
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i]) && ++seen === count) return i + 1
  }
  return text.length
}

export function MoneyInput({ value, onValueChange, minAmount, maxAmount, ...props }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const selection = useRef<number | null>(null)
  useLayoutEffect(() => {
    const input = ref.current
    if (!input) return
    const amount = value === '' ? null : Number(value)
    const valid = amount === null || (Number.isSafeInteger(amount) && (minAmount === undefined || amount >= minAmount) && (maxAmount === undefined || amount <= maxAmount))
    input.setCustomValidity(valid ? '' : `금액은 ${minAmount?.toLocaleString('ko-KR') ?? '0'}원${maxAmount === undefined ? ' 이상' : ` 이상 ${maxAmount.toLocaleString('ko-KR')}원 이하`}으로 입력해 주세요.`)
    if (selection.current !== null && document.activeElement === input) {
      input.setSelectionRange(selection.current, selection.current)
      selection.current = null
    }
  }, [value, minAmount, maxAmount])
  return <input {...props} ref={ref} type="text" inputMode="numeric" value={formatDigits(value)} onKeyDown={event => {
    props.onKeyDown?.(event)
    if (event.defaultPrevented) return
    const input = event.currentTarget
    const cursor = input.selectionStart
    if (cursor === null || cursor !== input.selectionEnd) return
    const isBackspace = event.key === 'Backspace' && input.value[cursor - 1] === ','
    const isDelete = event.key === 'Delete' && input.value[cursor] === ','
    if (!isBackspace && !isDelete) return
    const digitIndex = input.value.slice(0, cursor).replace(/,/g, '').length
    const removeAt = isBackspace ? digitIndex - 1 : digitIndex
    if (removeAt < 0 || removeAt >= value.length) return
    event.preventDefault()
    const next = value.slice(0, removeAt) + value.slice(removeAt + 1)
    selection.current = positionAfterDigits(formatDigits(next), isBackspace ? digitIndex - 1 : digitIndex)
    onValueChange(next)
  }} onChange={event => {
    const input = event.currentTarget
    const text = input.value
    if (!/^[0-9,]*$/.test(text)) return
    const before = text.slice(0, input.selectionStart ?? text.length).replace(/,/g, '').length
    const digits = text.replace(/,/g, '')
    selection.current = positionAfterDigits(formatDigits(digits), before)
    onValueChange(digits)
    // 쉼표만 지웠을 때는 숫자 상태가 그대로여서 React가 다시 그리지 않을 수 있다.
    if (digits === value) {
      input.value = formatDigits(value)
      input.setSelectionRange(selection.current, selection.current)
      selection.current = null
    }
  }} />
}
