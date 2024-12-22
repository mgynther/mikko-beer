import { render } from "@testing-library/react"
import { expect, test } from "vitest"
import ContainerInfo, { asText } from "./ContainerInfo"
import type { Container } from "../../core/container/types"

const container: Container = {
  id: '70bdc1c5-861f-4f65-afb8-c598f01e83d6',
  type: 'bottle',
  size: '0.25'
}

test('container info as text', () => {
  expect(asText(container)).toEqual('bottle 0.25')
})

test('renders container info', () => {
  const { getByText } = render(
    <ContainerInfo
      container={container}
    />
  )
  getByText('bottle 0.25')
})
