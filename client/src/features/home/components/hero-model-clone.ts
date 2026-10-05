import * as THREE from 'three'

/**
 * drei caches one GLTF scene. Object3D.clone shares geometry and materials
 * with that cache, and unmount cleanup disposes them. Copy those resources
 * onto the instance so dispose cannot blank the next mount.
 */
export function cloneModelWithUniqueResources(model: THREE.Object3D): THREE.Object3D {
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

export function disposeClonedModel(model: THREE.Object3D) {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry?.dispose()
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const m of mats) {
      m.dispose()
    }
  })
}
