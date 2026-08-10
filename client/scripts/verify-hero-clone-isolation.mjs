/**
 * Verifies cloneModelWithUniqueResources isolates geometry/materials from the
 * source scene so disposeClonedModel cannot corrupt a shared GLTF cache.
 */
import * as THREE from 'three'

const cloneModelWithUniqueResources = (model) => {
  const clonedModel = model.clone(true)

  clonedModel.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry = child.geometry.clone()
    child.material = Array.isArray(child.material)
      ? child.material.map((material) => material.clone())
      : child.material.clone()
  })

  return clonedModel
}

const disposeClonedModel = (model) => {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry?.dispose()
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const m of mats) {
      m.dispose()
    }
  })
}

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

disposeClonedModel(unique)

// Source resources must remain usable after disposing the unique clone.
sharedGeo.computeBoundingSphere()
if (!sharedGeo.boundingSphere) {
  throw new Error('source geometry was disposed')
}
sharedMat.color.set('#ffffff')
sharedMatB.color.set('#000000')

console.log('hero clone isolation ok')
