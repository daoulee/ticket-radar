import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { MoneyInput } from './MoneyInput'

function Form() {
  const [value, setValue] = useState('')
  return <form><label>금액<MoneyInput value={value} onValueChange={setValue} minAmount={1} maxAmount={100000000} required /></label><output data-testid="raw">{value}</output></form>
}

it('쉼표 표시와 실제 숫자, 가운데 편집 및 쉼표 앞 삭제를 유지한다', async () => {
  const user = userEvent.setup()
  render(<Form />)
  const input = screen.getByLabelText('금액') as HTMLInputElement
  await user.type(input, '120000')
  expect(input).toHaveValue('120,000')
  expect(screen.getByTestId('raw')).toHaveTextContent('120000')
  input.setSelectionRange(4, 4)
  await user.keyboard('{Backspace}')
  expect(input).toHaveValue('12,000')
  expect(screen.getByTestId('raw')).toHaveTextContent('12000')
  await user.clear(input)
  await user.paste('12,345,678')
  expect(input).toHaveValue('12,345,678')
  expect(screen.getByTestId('raw')).toHaveTextContent('12345678')
  await user.clear(input)
  expect(input).toHaveValue('')
  expect(input.validity.valueMissing).toBe(true)
})

it('입력 상한을 넘어가면 폼 유효성 검사를 통과하지 않는다', async () => {
  const user = userEvent.setup()
  render(<Form />)
  const input = screen.getByLabelText('금액') as HTMLInputElement
  await user.type(input, '100000001')
  expect(input).toHaveValue('100,000,001')
  expect(input.checkValidity()).toBe(false)
})
