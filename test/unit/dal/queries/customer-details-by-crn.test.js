// Test framework dependencies
import { parse } from 'graphql'
import { describe, test, expect } from 'vitest'

// Thing under test
import { customerDetailsByCrn } from '../../../../src/dal/queries/customer-details-by-crn.js'

describe('When the customerDetailsByCrn query is parsed', () => {
  test('it is valid GraphQL syntax', () => {
    expect(() => parse(customerDetailsByCrn)).not.toThrow()
  })

  test('it contains the Query operation and the correct variable', () => {
    // Parsing the GQL query returns an Abstract Syntax Tree (ast)
    // this converts the string into a structural representation of the query.
    // This allows it to be inspected and validated.

    const ast = parse(customerDetailsByCrn)
    const operation = ast.definitions[0]
    expect(operation.name.value).toBe('Customer')

    const variable = operation.variableDefinitions[0]
    expect(variable.variable.name.value).toBe('crn')
    expect(variable.type.kind).toBe('NonNullType')
    expect(variable.type.type.name.value).toBe('ID')
  })
})
