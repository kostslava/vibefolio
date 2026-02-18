"use client";

import React, { useState, useCallback, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import DraggableCard from "@/components/DraggableCard";
import { people } from "@/lib/data";

export default function Home() {
  const [hasBegun, setHasBegun] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [cardZIndices, setCardZIndices] = useState<Record<string, number>>(
    people.reduce((acc, person, i) => ({ ...acc, [person.id]: 100 + i }), {})
  );
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    // Calculate initial positions after mount when window is available
    const positions: Record<string, { x: number; y: number }> = {};
    const cols = 3;
    const rows = Math.ceil(people.length / cols);
    
    const cardWidth = 200;
    const cardHeight = 120;
    const spacing = 50;
    
    const totalWidth = cols * cardWidth + (cols - 1) * spacing;
    const totalHeight = rows * cardHeight + (rows - 1) * spacing;
    
    const startX = (window.innerWidth - totalWidth) / 2;
    const startY = (window.innerHeight - totalHeight) / 2 + 100;
    
    people.forEach((person, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      positions[person.id] = {
        x: startX + col * (cardWidth + spacing),
        y: startY + row * (cardHeight + spacing),
      };
    });
    
    setCardPositions(positions);
  }, []);

  const handleBegin = () => {
    setHasBegun(true);
  };

  const handleDragStart = useCallback((personId: string) => {
    setDraggingIndex(people.findIndex((p) => p.id === personId));
    // Bring dragged card to front
    setCardZIndices((prev) => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [personId]: maxZ + 1 };
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  return (
    <div className="min-h-screen">
      {!hasBegun ? (
        <LandingPage onBegin={handleBegin} />
      ) : (
        <>
          {/* Draggable person cards */}
          {people.map((person, index) => {
            const pos = cardPositions[person.id] || { x: 100, y: 100 };
            return (
              <DraggableCard
                key={person.id}
                person={person}
                initialX={pos.x}
                initialY={pos.y}
                index={index}
                onDragStart={() => handleDragStart(person.id)}
                onDragEnd={handleDragEnd}
                zIndex={cardZIndices[person.id]}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
