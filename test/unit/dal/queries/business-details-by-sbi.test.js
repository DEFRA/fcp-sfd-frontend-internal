// Test framework dependencies
import { parse } from 'graphql'
import { describe, test, expect } from 'vitest'

// Thing under test
import { businessDetailsBySbi } from '../../../../src/dal/queries/business-details-by-sbi.js'

describe('When the businessDetailsBySbi query is parsed', () => {
  test('it is valid GraphQL syntax', () => {
    expect(() => parse(businessDetailsBySbi)).not.toThrow()
  })

  test('it contains the Query operation and the correct variable', () => {
    // Parsing the GQL query returns an Abstract Syntax Tree (ast)
    // this converts the string into a structural representation of the query.
    // This allows it to be inspected and validated.

    const ast = parse(businessDetailsBySbi)
    const operation = ast.definitions[0]
    expect(operation.name.value).toBe('Business')

    const variable = operation.variableDefinitions[0]
    expect(variable.variable.name.value).toBe('sbi')
    expect(variable.type.kind).toBe('NonNullType')
    expect(variable.type.type.name.value).toBe('ID')
  })
})
