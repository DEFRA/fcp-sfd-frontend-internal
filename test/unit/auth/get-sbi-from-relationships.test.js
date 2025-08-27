import { describe, test, expect } from 'vitest'
import { getSbiFromRelationships } from '../../../src/auth/get-sbi-from-relationships'

describe('getSbiFromRelationships', () => {
  test('when items of relationships are split by : should return second component of items where first component equal orgId ', async () => {
    const orgId = '345426782'
    const relationships = ['12345675:76543898654:7876543:0:daioy', '345426782:765800654:7876567843', '6542:8:daipoy']
    const result = await getSbiFromRelationships(orgId, relationships)
    expect(result).toBe('765800654')
  })

  test('when items of relationships are split by : should return null if none of the items first component equal orgId ', async () => {
    const orgId = '34542000782'
    const relationships = ['12345675:76543898654:7876543:0:daioy', '345426782:765800654:7876567843', '6542:8:daipoy']
    const result = await getSbiFromRelationships(orgId, relationships)
    expect(result).toBe(null)
  })
})
