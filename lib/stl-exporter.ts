"use client";

import * as THREE from "three";

// STL Exporter - baseado no THREE.js STLExporter
export function exportToSTL(scene: THREE.Object3D, filename: string = "model.stl"): void {
  const stlString = generateSTLString(scene);
  downloadFile(stlString, filename, "application/octet-stream");
}

// Gera string STL ASCII a partir da cena
function generateSTLString(scene: THREE.Object3D): string {
  let output = "solid exported\n";
  
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      const matrixWorld = object.matrixWorld;
      
      if (geometry.isBufferGeometry) {
        const positionAttribute = geometry.getAttribute("position");
        const normalAttribute = geometry.getAttribute("normal");
        const indexAttribute = geometry.getIndex();
        
        if (!positionAttribute) return;
        
        const vertices: THREE.Vector3[] = [];
        const normals: THREE.Vector3[] = [];
        
        // Extrai vertices e normais
        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
          );
          vertex.applyMatrix4(matrixWorld);
          vertices.push(vertex);
          
          if (normalAttribute) {
            const normal = new THREE.Vector3(
              normalAttribute.getX(i),
              normalAttribute.getY(i),
              normalAttribute.getZ(i)
            );
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrixWorld);
            normal.applyMatrix3(normalMatrix).normalize();
            normals.push(normal);
          }
        }
        
        // Processa triangulos
        if (indexAttribute) {
          // Geometria indexada
          for (let i = 0; i < indexAttribute.count; i += 3) {
            const a = indexAttribute.getX(i);
            const b = indexAttribute.getX(i + 1);
            const c = indexAttribute.getX(i + 2);
            
            output += writeTriangle(
              vertices[a], vertices[b], vertices[c],
              normalAttribute ? normals[a] : calculateNormal(vertices[a], vertices[b], vertices[c])
            );
          }
        } else {
          // Geometria nao indexada
          for (let i = 0; i < vertices.length; i += 3) {
            output += writeTriangle(
              vertices[i], vertices[i + 1], vertices[i + 2],
              normalAttribute ? normals[i] : calculateNormal(vertices[i], vertices[i + 1], vertices[i + 2])
            );
          }
        }
      }
    }
  });
  
  output += "endsolid exported\n";
  return output;
}

// Escreve um triangulo no formato STL
function writeTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3, normal: THREE.Vector3): string {
  return `  facet normal ${normal.x} ${normal.y} ${normal.z}
    outer loop
      vertex ${v1.x} ${v1.y} ${v1.z}
      vertex ${v2.x} ${v2.y} ${v2.z}
      vertex ${v3.x} ${v3.y} ${v3.z}
    endloop
  endfacet
`;
}

// Calcula normal de um triangulo
function calculateNormal(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3): THREE.Vector3 {
  const edge1 = new THREE.Vector3().subVectors(v2, v1);
  const edge2 = new THREE.Vector3().subVectors(v3, v1);
  const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
  return normal;
}

// Faz download do arquivo
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Exporta para OBJ (formato alternativo)
export function exportToOBJ(scene: THREE.Object3D, filename: string = "model.obj"): void {
  const objString = generateOBJString(scene);
  downloadFile(objString, filename, "text/plain");
}

// Gera string OBJ a partir da cena
function generateOBJString(scene: THREE.Object3D): string {
  let output = "# OBJ file exported from Furniture Viewer\n";
  output += "# https://v0.dev\n\n";
  
  let vertexOffset = 0;
  
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const geometry = object.geometry;
      const matrixWorld = object.matrixWorld;
      
      if (geometry.isBufferGeometry) {
        const positionAttribute = geometry.getAttribute("position");
        const normalAttribute = geometry.getAttribute("normal");
        const indexAttribute = geometry.getIndex();
        
        if (!positionAttribute) return;
        
        output += `o ${object.name || "mesh"}\n`;
        
        // Vertices
        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
          );
          vertex.applyMatrix4(matrixWorld);
          output += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
        }
        
        // Normais
        if (normalAttribute) {
          for (let i = 0; i < normalAttribute.count; i++) {
            const normal = new THREE.Vector3(
              normalAttribute.getX(i),
              normalAttribute.getY(i),
              normalAttribute.getZ(i)
            );
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrixWorld);
            normal.applyMatrix3(normalMatrix).normalize();
            output += `vn ${normal.x} ${normal.y} ${normal.z}\n`;
          }
        }
        
        // Faces
        if (indexAttribute) {
          for (let i = 0; i < indexAttribute.count; i += 3) {
            const a = indexAttribute.getX(i) + 1 + vertexOffset;
            const b = indexAttribute.getX(i + 1) + 1 + vertexOffset;
            const c = indexAttribute.getX(i + 2) + 1 + vertexOffset;
            
            if (normalAttribute) {
              output += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
            } else {
              output += `f ${a} ${b} ${c}\n`;
            }
          }
        } else {
          for (let i = 0; i < positionAttribute.count; i += 3) {
            const a = i + 1 + vertexOffset;
            const b = i + 2 + vertexOffset;
            const c = i + 3 + vertexOffset;
            
            if (normalAttribute) {
              output += `f ${a}//${a} ${b}//${b} ${c}//${c}\n`;
            } else {
              output += `f ${a} ${b} ${c}\n`;
            }
          }
        }
        
        vertexOffset += positionAttribute.count;
        output += "\n";
      }
    }
  });
  
  return output;
}
