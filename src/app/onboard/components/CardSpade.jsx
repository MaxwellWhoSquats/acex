import React from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model(props) {
  const { nodes, materials } = useGLTF('/spadescard.glb')
  return (
    <group {...props} dispose={null} scale={[40, 40, 40]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_1.geometry}
        material={materials.Material}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_2.geometry}
        material={materials['Material.001']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube_3.geometry}
        material={materials['Material.002']}
      />
    </group>
  )
}

useGLTF.preload('/spadescard.glb')