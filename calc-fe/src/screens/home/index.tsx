import { ColorSwatch, Group } from '@mantine/core';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { SWATCHES } from '@/constants';

interface ApiResponseItem {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('white');
  const [latex, setLatex] = useState<string[]>([]);
  const [latexPos, setLatexPos] = useState({ x: 50, y: 200 });

  /* ---------------- Canvas + Background ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ✅ FORCE BLACK BACKGROUND
    canvas.style.background = 'black';

    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
  }, []);

  /* ---------------- Load MathJax ---------------- */
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).MathJax.Hub.Config({
        tex2jax: { inlineMath: [['\\(', '\\)']] },
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  /* ---------------- Re-render LaTeX ---------------- */
  useEffect(() => {
    if (latex.length && (window as any).MathJax) {
      (window as any).MathJax.Hub.Queue(['Typeset', (window as any).MathJax.Hub]);
    }
  }, [latex]);

  /* ---------------- Drawing ---------------- */
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  /* ---------------- Run backend ---------------- */
  const run = async () => {
    const canvas = canvasRef.current!;
    const image = canvas.toDataURL('image/png');

    const res = await axios.post('http://127.0.0.1:8900/calculate/', {
      image,
      dict_of_vars: {},
    });

    console.log('✅ BACKEND RESPONSE:', res.data);

    const items: ApiResponseItem[] = res.data.data;

    const latexResults = items.map(
      (i) => `\\(\\Large ${i.expr} = ${i.result} \\)`
    );

    setLatex(latexResults);
  };

  /* ---------------- Reset ---------------- */
  const reset = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setLatex([]);
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button onClick={reset}>Reset</Button>

        <Group>
          {SWATCHES.map((c) => (
            <ColorSwatch key={c} color={c} onClick={() => setColor(c)} />
          ))}
        </Group>

        <Button onClick={run}>Run</Button>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {latex.map((l, i) => (
        <Draggable
          key={i}
          defaultPosition={latexPos}
          onStop={(e, d) => setLatexPos({ x: d.x, y: d.y })}
        >
          <div className="absolute text-white text-3xl">
            <span dangerouslySetInnerHTML={{ __html: l }} />
          </div>
        </Draggable>
      ))}
    </>
  );
}
