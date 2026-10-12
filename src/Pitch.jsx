import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Three.js owns drawing and the camera. React remains the source of truth for players.
export default function Pitch({
  players,
  selected,
  onSelect,
  view,
  format,
  resetKey,
  moveMode,
  onMove,
  tool, tactics, onTactic,
}) {
  const host = useRef(null),
    sceneApi = useRef(null),
    latest = useRef({ players, selected, onSelect, onMove, moveMode, tool, tactics, onTactic });
  latest.current = { players, selected, onSelect, onMove, moveMode, tool, tactics, onTactic };
  const [error, setError] = useState("");
  useEffect(() => {
    const el = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(
        "3D could not start on this device. You can still select players from the team list. Try a browser with WebGL enabled.",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#111d19", 1);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive football pitch. Use the player list to select players with a keyboard.",
    );
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 250);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 40;
    controls.maxDistance = 110;
    controls.maxPolarAngle = Math.PI / 2.35;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x182b23, 2.6));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(-20, 40, 10);
    scene.add(light);
    const field = new THREE.Group();
    scene.add(field);
    const mesh = (geo, color, x, y, z) => {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
      );
      m.position.set(x, y, z);
      field.add(m);
      return m;
    };
    mesh(new THREE.BoxGeometry(35, 1, 47), "#203f32", 0, -0.7, 0);
    for (let i = 0; i < 10; i++)
      mesh(
        new THREE.BoxGeometry(32, 0.08, 4.4),
        i % 2 ? "#28724d" : "#246946",
        0,
        -0.12,
        -19.8 + i * 4.4,
      );
    const line = (pts) => {
      const g = new THREE.BufferGeometry().setFromPoints(
        pts.map(([x, z]) => new THREE.Vector3(x, 0.02, z)),
      );
      const l = new THREE.Line(
        g,
        new THREE.LineBasicMaterial({ color: "#b9d9bb" }),
      );
      field.add(l);
    };
    const rect = (x, z, w, h) =>
      line([
        [x, z],
        [x + w, z],
        [x + w, z + h],
        [x, z + h],
        [x, z],
      ]);
    rect(-16, -22, 32, 44);
    line([
      [-16, 0],
      [16, 0],
    ]);
    line(
      Array.from({ length: 81 }, (_, i) => [
        4.6 * Math.cos((i * Math.PI) / 40),
        4.6 * Math.sin((i * Math.PI) / 40),
      ]),
    );
    for (const side of [-1, 1]) {
      rect(-8, side === 1 ? 14 : -22, 16, 8);
      rect(-4, side === 1 ? 19 : -22, 8, 3);
      // Simple goal posts make the depth of the scene legible without heavy assets.
      for (const x of [-3, 3])
        mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8),
          "#edf2e9",
          x,
          1.25,
          side * 22,
        );
      const bar = mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 6, 8),
        "#edf2e9",
        0,
        2.5,
        side * 22,
      );
      bar.rotation.z = Math.PI / 2;
    }
    const markers = new THREE.Group();
    field.add(markers);
    const disposeGroup = (group) => {
      while (group.children.length) {
        const child = group.children[0];
        child.traverse((o) => {
          o.geometry?.dispose();
          if (o.material) {
            o.material.map?.dispose();
            o.material.dispose();
          }
        });
        group.remove(child);
      }
    };
    let nameLabels = [];
    const updatePlayers = () => {
      nameLabels.forEach(({ button }) => button.remove());
      nameLabels = [];
      disposeGroup(markers);
      latest.current.players.forEach((p) => {
        const group = new THREE.Group();
        group.position.set(p.x, 0, p.z);
        group.userData.playerId = p.id;
        const active = p.id === latest.current.selected;
        if (active) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.8, 0.09, 8, 48),
            new THREE.MeshBasicMaterial({ color: "#eaf5c0" }),
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.15;
          group.add(ring);
        }
        const c = document.createElement("canvas");
        c.width = 128;
        c.height = 128;
        const ctx = c.getContext("2d");
        // A camera-facing jersey keeps its printed number legible from every angle.
        ctx.beginPath();
        const outline = [
          [34, 10],
          [49, 18],
          [79, 18],
          [94, 10],
          [123, 36],
          [108, 60],
          [94, 51],
          [94, 120],
          [34, 120],
          [34, 51],
          [20, 60],
          [5, 36],
        ];
        outline.forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        ctx.closePath();
        ctx.fillStyle = p.role === "GK" ? "#dce9a4" : "#f4824f";
        ctx.fill();
        ctx.strokeStyle = active ? "#ffffff" : "#192f24";
        ctx.lineWidth = active ? 7 : 3;
        ctx.stroke();
        ctx.fillStyle = "#182a21";
        ctx.font = "bold 49px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.number), 64, 76);
        const texture = new THREE.CanvasTexture(c);
        texture.colorSpace = THREE.SRGBColorSpace;
        const label = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: texture, depthTest: false }),
        );
        label.scale.set(4.4, 4.4, 1);
        label.position.y = 2.3;
        label.userData.playerId = p.id;
        group.add(label);
        // Screen-sized HTML labels stay readable when the pitch is zoomed out.
        if (p.name.trim()) {
          const button = document.createElement("button");
          button.className = "pitch-name";
          button.textContent = p.name.trim();
          button.setAttribute(
            "aria-label",
            `Select ${p.name.trim()}, number ${p.number}`,
          );
          button.onclick = () => latest.current.onSelect(p.id);
          el.appendChild(button);
          nameLabels.push({ button, group });
        }
        markers.add(group);
      });
    };
    const tactical = new THREE.Group();
    field.add(tactical);
    let startPoint = null;
    const drawTactics = () => {
      disposeGroup(tactical);
      const {ball,arrows} = latest.current.tactics;
      if (ball) {
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(.65,16,12),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.7}));
        sphere.position.set(ball.x,.7,ball.z); tactical.add(sphere);
        const patch = new THREE.Mesh(new THREE.SphereGeometry(.67,6,4),new THREE.MeshBasicMaterial({color:0x14251a,wireframe:true}));
        patch.position.copy(sphere.position); tactical.add(patch);
      }
      arrows.forEach(a=>{
        const from = new THREE.Vector3(a.from.x,.2,a.from.z), to = new THREE.Vector3(a.to.x,.2,a.to.z);
        const delta = to.clone().sub(from), length=delta.length();
        if(length<.4) return;
        const color=a.kind==="pass" ? 0xffc18c : 0xe6f7af;
        const material = a.kind==="pass" ? new THREE.LineDashedMaterial({color,dashSize:.7,gapSize:.45}) : new THREE.LineBasicMaterial({color});
        const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([from,to]),material);
        line.computeLineDistances(); tactical.add(line);
        const direction=delta.normalize(), side=new THREE.Vector3(-direction.z,0,direction.x);
        const wing1=to.clone().addScaledVector(direction,-1.3).addScaledVector(side,.7);
        const wing2=to.clone().addScaledVector(direction,-1.3).addScaledVector(side,-.7);
        tactical.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([wing1,to,wing2]),new THREE.LineBasicMaterial({color})));
      });
      if(startPoint) {
        const ring=new THREE.Mesh(new THREE.RingGeometry(.5,.8,24),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
        ring.rotation.x=-Math.PI/2;ring.position.set(startPoint.x,.25,startPoint.z);tactical.add(ring);
      }
    };
    const resetDraft = () => {startPoint=null;drawTactics();};
    const setCamera = (mode) => {
      camera.position.set(...(mode === "top" ? [0, 76, 0.01] : [35, 48, 51]));
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.enableRotate = mode !== "top";
      controls.update();
    };
    const resize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.fov = THREE.MathUtils.radToDeg(
        2 *
          Math.atan(
            Math.tan(THREE.MathUtils.degToRad(43) / 2) /
              Math.min(1, camera.aspect),
          ),
      );
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    let down = null, drag = null;
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const aim = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
      ray.setFromCamera(pointer, camera);
    };
    const groundPoint = () => {
      const point = ray.ray.intersectPlane(ground, new THREE.Vector3());
      return point ? field.worldToLocal(point) : null;
    };
    const pointerDown = (e) => {
      if (e.button !== 0 || drag) return;
      down = [e.clientX, e.clientY];
      aim(e);
      const hit = ray.intersectObjects(markers.children, true).find(h=>h.object.userData.playerId);
      if (!hit || !latest.current.moveMode || latest.current.tool!=="players") return;
      const id = hit.object.userData.playerId;
      const p = latest.current.players.find(p=>p.id===id);
      const point = groundPoint();
      if (!point) return;
      drag = {id, pointerId:e.pointerId, dx:p.x-point.x, dz:p.z-point.z, x:p.x, z:p.z};
      renderer.domElement.setPointerCapture(e.pointerId);
      latest.current.onSelect(id);
      e.preventDefault();
    };
    const pointerMove = (e) => {
      if (!drag || e.pointerId!==drag.pointerId) return;
      aim(e);
      const point = groundPoint();
      if (!point) return;
      drag.x = THREE.MathUtils.clamp(point.x+drag.dx,-15,15);
      drag.z = THREE.MathUtils.clamp(point.z+drag.dz,-21,21);
      // Preview in Three.js; commit to React only at the end of the gesture.
      const group = markers.children.find(g=>g.userData.playerId===drag.id);
      if (group) group.position.set(drag.x,0,drag.z);
    };
    const finish = (e, cancelled=false) => {
      if (drag) {
        if(e.pointerId!==drag.pointerId) return;
        const result=drag; drag=null;
        if(renderer.domElement.hasPointerCapture(e.pointerId)) renderer.domElement.releasePointerCapture(e.pointerId);
        if(!cancelled && down && Math.hypot(e.clientX-down[0],e.clientY-down[1])>4) latest.current.onMove(result.id,{x:result.x,z:result.z});
        else updatePlayers();
      } else if (!cancelled && down && Math.hypot(e.clientX-down[0],e.clientY-down[1])<=6) {
        aim(e);
        if(latest.current.moveMode && latest.current.tool!=="players") {
          const p=groundPoint();
          if(p && Math.abs(p.x)<=16 && Math.abs(p.z)<=22) {
            const point={x:THREE.MathUtils.clamp(p.x,-15,15),z:THREE.MathUtils.clamp(p.z,-21,21)};
            if(latest.current.tool==="ball") latest.current.onTactic({kind:"ball",point});
            else if(!startPoint) {startPoint=point;drawTactics();}
            else if(Math.hypot(point.x-startPoint.x,point.z-startPoint.z)>.4) {latest.current.onTactic({kind:latest.current.tool,from:startPoint,to:point});startPoint=null;}
          }
          down=null;return;
        }
        const hit=ray.intersectObjects(markers.children,true).find(h=>h.object.userData.playerId);
        if(hit) latest.current.onSelect(hit.object.userData.playerId);
      }
      down=null;
    };
    const pointerUp = e=>finish(e);
    const pointerCancel = e=>finish(e,true);
    const contextLost = (e) => {
      e.preventDefault();
      setError(
        "The 3D view was interrupted. Reload to restart it; the team list remains available.",
      );
    };
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointercancel", pointerCancel);
    sceneApi.current = { updatePlayers, setCamera, field, controls, drawTactics, resetDraft };
    drawTactics();
    updatePlayers();
    setCamera("3d");
    resize();
    let frame;
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
      nameLabels.forEach(({ button, group }) => {
        const position = group
          .localToWorld(new THREE.Vector3(0, 4.9, 0))
          .project(camera);
        button.hidden = position.z > 1 || position.z < -1;
        button.style.left = `${((position.x + 1) * el.clientWidth) / 2}px`;
        button.style.top = `${((1 - position.y) * el.clientHeight) / 2}px`;
      });
    };
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointercancel", pointerCancel);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      nameLabels.forEach(({ button }) => button.remove());
      disposeGroup(field);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      sceneApi.current = null;
    };
  }, []);
  useEffect(() => { sceneApi.current?.resetDraft(); }, [tool, moveMode, format, tactics]);
  useEffect(() => {
    if(sceneApi.current) sceneApi.current.controls.enabled = !moveMode;
  }, [moveMode]);
  useEffect(() => {
    sceneApi.current?.updatePlayers();
  }, [players, selected]);
  useEffect(() => {
    sceneApi.current?.setCamera(view);
  }, [view, resetKey]);
  useEffect(() => {
    if (sceneApi.current)
      sceneApi.current.field.scale.z = format === 11 ? 1 : 0.85;
  }, [format]);
  return (
    <div className="pitch-host" ref={host}>
      {error && (
        <div className="pitch-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
