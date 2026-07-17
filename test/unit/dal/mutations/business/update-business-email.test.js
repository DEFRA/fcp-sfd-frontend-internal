import { parse } from 'graphql'
import { describe, test, expect } from 'vitest'
import { updateBusinessEmailMutation } from '../../../../../src/dal/mutations/business/update-business-email.js'

describe('When the updateBusinessEmailMutation is parsed', () => {
  test('it is valid GraphQL syntax', () => {
    expect(() => parse(updateBusinessEmailMutation)).not.toThrow()
  })

  test('it contains the Mutation operation and the correct variable', () => {
    const ast = parse(updateBusinessEmailMutation)
    const operation = ast.definitions[0]
    expect(operation.name.value).toBe('Mutation')

    const variable = operation.variableDefinitions[0]
    expect(variable.variable.name.value).toBe('input')
    expect(variable.type.type.name.value).toBe('UpdateBusinessEmailInput')
  })
})
