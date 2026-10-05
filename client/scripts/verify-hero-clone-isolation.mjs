/**
 * Verifies cloneModelWithUniqueResources isolates geometry and materials from
 * the source scene so disposeClonedModel cannot corrupt a shared GLTF cache.
 */
import * as THREE from 'three'
import {
  cloneModelWithUniqueResources,
  disposeClonedModel,
} from '../src/features/home/components/hero-model-clone.ts'

const source = new THREE.Group()
const sharedGeo = new THREE.BoxGeometry(1, 1, 1)
const sharedMat = new THREE.MeshStandardMaterial({ name: 'ScreenDisplay' })
const sharedMatB = new THREE.MeshStandardMaterial({ name: 'Body' })
const mesh = new THREE.Mesh(sharedGeo, [sharedMat, sharedMatB])
source.add(mesh)

const shallow = source.clone(true)
const shallowMesh = shallow.children[0]
if (shallowMesh.geometry !== sharedGeo) {
  throw new Error('expected shallow clone to share geometry')
}
if (shallowMesh.material[0] !== sharedMat || shallowMesh.material[1] !== sharedMatB) {
  throw new Error('expected shallow clone to share materials')
}

const unique = cloneModelWithUniqueResources(source)
const uniqueMesh = unique.children[0]
if (uniqueMesh.geometry === sharedGeo) {
  throw new Error('unique clone still shares geometry')
}
if (uniqueMesh.material[0] === sharedMat || uniqueMesh.material[1] === sharedMatB) {
  throw new Error('unique clone still shares materials')
}

const cachedMap = new THREE.Texture()
sharedMat.map = cachedMap
uniqueMesh.material[0].map = null
uniqueMesh.material[0].emissiveMap = null
if (sharedMat.map !== cachedMap) {
  throw new Error('unique clone map mutation leaked to source material')
}

disposeClonedModel(unique)

sharedGeo.computeBoundingSphere()
if (!sharedGeo.boundingSphere) {
  throw new Error('source geometry was disposed')
}
sharedMat.color.set('#ffffff')
sharedMatB.color.set('#000000')
if (sharedMat.map !== cachedMap) {
  throw new Error('dispose leaked map null onto the source material')
}

console.log('hero clone isolation ok')
