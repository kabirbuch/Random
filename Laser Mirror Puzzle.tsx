import React, { useState, useEffect, useRef } from 'react';

const LaserMirrorPuzzle = () => {
  // Grid configuration
  const gridSize = 10; // 10x10 grid of cells
  const cellSize = 40;
  const gridWidth = gridSize * cellSize;
  const gridHeight = gridSize * cellSize;
  const borderSize = cellSize;
  const totalWidth = gridWidth + 2 * borderSize;
  const totalHeight = gridHeight + 2 * borderSize;

  // Laser clues - positioned according to your specific instructions
  const laserClues = [
    // Top edge (y=0)
    { x: 2.5, y: 0, value: 112 },
    { x: 4.5, y: 0, value: 48 },    // Moved one to the right
    { x: 5.5, y: 0, value: 3087 },  // Moved one to the right
    { x: 6.5, y: 0, value: 9 },     // Moved one to the right
    { x: 9.5, y: 0, value: 1 },
    // Right edge (x=10)
    { x: 10, y: 1.5, value: 4 },    // Moved one up
    { x: 10, y: 2.5, value: 27 },   // Moved one up
    { x: 10, y: 6.5, value: 16 },   // Moved one up
    // Bottom edge (y=10)
    { x: 0.5, y: 10, value: 2025 }, // Moved one to the left
    { x: 3.5, y: 10, value: 12 },
    { x: 4.5, y: 10, value: 64 },
    { x: 5.5, y: 10, value: 5 },
    { x: 7.5, y: 10, value: 405 },  // Moved one to the left
    // Left edge (x=0)
    { x: 0, y: 3.5, value: 27 },
    { x: 0, y: 7.5, value: 12 },
    { x: 0, y: 8.5, value: 225 },
  ];

  // Create array of all possible laser positions
  const getAllLaserPositions = () => {
    const positions = [];
    
    // Top edge
    for (let x = 0.5; x < 10; x += 1) {
      positions.push({ x, y: 0 });
    }
    
    // Right edge
    for (let y = 0.5; y < 10; y += 1) {
      positions.push({ x: 10, y });
    }
    
    // Bottom edge
    for (let x = 0.5; x < 10; x += 1) {
      positions.push({ x, y: 10 });
    }
    
    // Left edge
    for (let y = 0.5; y < 10; y += 1) {
      positions.push({ x: 0, y });
    }
    
    return positions;
  };

  // Initialize grid with no mirrors - grid points are at cell centers
  const [grid, setGrid] = useState(() => {
    const initGrid = {};
    for (let x = 0.5; x < 10; x++) {
      for (let y = 0.5; y < 10; y++) {
        initGrid[`${x},${y}`] = 0;
      }
    }
    return initGrid;
  });
  
  // State for laser visibility (0 = none, 1 = all, 2 = only numbered)
  const [laserVisibility, setLaserVisibility] = useState(1);
  
  // Canvas refs
  const gridCanvasRef = useRef(null);
  const laserCanvasRef = useRef(null);
  
  // Helper to get grid value at a position
  const getGridValue = (x, y) => {
    return grid[`${x},${y}`] || 0;
  };
  
  // Toggle cell state (empty, \ mirror, / mirror)
  const toggleCell = (x, y) => {
    const key = `${x},${y}`;
    const newGrid = { ...grid };
    
    // Cycle through states: 0 (empty) -> 1 (\ mirror) -> 2 (/ mirror) -> 0 (empty)
    newGrid[key] = ((newGrid[key] || 0) + 1) % 3;
    setGrid(newGrid);
  };
  
  // Toggle laser visibility mode
  const toggleLaserVisibility = () => {
    setLaserVisibility((laserVisibility + 1) % 3);
  };
  
  // Calculate laser paths with corrected segment lengths (full grid = 11 units)
  const calculateLaserPaths = () => {
    if (laserVisibility === 0) return []; // No lasers visible
    
    const paths = [];
    
    // Get all laser positions
    const allLaserPositions = getAllLaserPositions();
    
    // Get starting points based on visibility mode
    const startingPoints = [];
    
    allLaserPositions.forEach(pos => {
      const clue = laserClues.find(c => 
        Math.abs(c.x - pos.x) < 0.1 && Math.abs(c.y - pos.y) < 0.1
      );
      
      // Skip if we're only showing numbered lasers and this laser has no number
      if (laserVisibility === 2 && !clue) return;
      
      let direction;
      if (pos.y === 0) direction = 'down';
      else if (pos.x === 10) direction = 'left';
      else if (pos.y === 10) direction = 'up';
      else if (pos.x === 0) direction = 'right';
      
      startingPoints.push({
        x: pos.x,
        y: pos.y,
        direction,
        value: clue ? clue.value : null
      });
    });
    
    // Calculate path for each laser
    startingPoints.forEach(start => {
      const path = [];
      let currentX = start.x;
      let currentY = start.y;
      let currentDirection = start.direction;
      const segments = [];
      let lastTurn = { x: currentX, y: currentY };
      
      // Track visited cells to detect loops - limit to 100 visits maximum
      const visited = new Set();
      let maxSteps = 100; // Prevent infinite loops
      
      // Move in small steps (0.5 units) in the current direction
      while (maxSteps > 0) {
        maxSteps--;
        
        // Move in the current direction
        switch (currentDirection) {
          case 'up': currentY -= 0.5; break;
          case 'right': currentX += 0.5; break;
          case 'down': currentY += 0.5; break;
          case 'left': currentX -= 0.5; break;
        }
        
        path.push({ x: currentX, y: currentY, direction: currentDirection });
        
        // Check if we've gone outside the grid boundaries
        if (
          currentX < 0 || currentX > 10 ||
          currentY < 0 || currentY > 10
        ) {
          // Calculate segment length accounting for the 0.5 offset on both sides
          // A full grid crossing should be 11 units (10 + 0.5 + 0.5)
          let distance = Math.max(
            Math.abs(currentX - lastTurn.x),
            Math.abs(currentY - lastTurn.y)
          );
          
          // Add 0.5 to account for the starting offset from the edge
          if (lastTurn.x === start.x && lastTurn.y === start.y) {
            distance += 0.5;
          }
          
          // Multiply by 2 to convert grid units to segment length
          // Then divide by 2 to normalize back for expected values
          let segmentLength = distance;
          
          // If this is the only segment, it should be an odd number (1, 3, 5, ..., 11)
          if (segments.length === 0 && 
              (Math.abs(currentX - start.x) > 9.9 || Math.abs(currentY - start.y) > 9.9)) {
            segmentLength = 11;
          }
          
          segments.push(segmentLength);
          break;
        }
        
        // Check if at a cell center (where mirrors are placed)
        const atCellCenter = (
          Math.abs(Math.floor(currentX) + 0.5 - currentX) < 0.01 && 
          Math.abs(Math.floor(currentY) + 0.5 - currentY) < 0.01
        );
        
        // Handle mirrors in cell centers
        if (atCellCenter) {
          const cellX = Math.floor(currentX) + 0.5;
          const cellY = Math.floor(currentY) + 0.5;
          const cellState = getGridValue(cellX, cellY);
          
          // Create a unique key for this position and direction to detect loops
          const key = `${cellX},${cellY},${currentDirection}`;
          if (visited.has(key)) {
            break;
          }
          visited.add(key);
          
          // Handle mirror reflection
          if (cellState !== 0) {
            // Calculate segment length accounting for the 0.5 offset from the edge
            let distance = Math.max(
              Math.abs(currentX - lastTurn.x),
              Math.abs(currentY - lastTurn.y)
            );
            
            // Add 0.5 if this is the first segment from the starting point
            if (lastTurn.x === start.x && lastTurn.y === start.y) {
              distance += 0.5;
            }
            
            // Segment length should be the number of cells traversed
            let segmentLength = distance;
            segments.push(segmentLength);
            lastTurn = { x: currentX, y: currentY };
            
            if (cellState === 1) { // \ mirror
              switch (currentDirection) {
                case 'up': currentDirection = 'left'; break;
                case 'right': currentDirection = 'down'; break;
                case 'down': currentDirection = 'right'; break;
                case 'left': currentDirection = 'up'; break;
              }
            } else if (cellState === 2) { // / mirror
              switch (currentDirection) {
                case 'up': currentDirection = 'right'; break;
                case 'right': currentDirection = 'up'; break;
                case 'down': currentDirection = 'left'; break;
                case 'left': currentDirection = 'down'; break;
              }
            }
          }
        }
      }
      
      // Calculate product of segment lengths
      const product = segments.reduce((acc, length) => acc * length, 1);
      
      paths.push({
        path,
        startX: start.x,
        startY: start.y,
        segments,
        product,
        clueValue: start.value
      });
    });
    
    return paths;
  };
  
  // Draw the grid
  useEffect(() => {
    const canvas = gridCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, totalWidth, totalHeight);
    
    // Draw light background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, totalWidth, totalHeight);
    
    // Convert grid coordinates to canvas coordinates
    const gridToCanvas = (x, y) => ({
      x: borderSize + x * cellSize,
      y: borderSize + y * cellSize
    });
    
    // Draw grid
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Draw outer grid box
    const topLeft = gridToCanvas(0, 0);
    const bottomRight = gridToCanvas(10, 10);
    ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
    
    // Draw grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#888';
    
    // Draw vertical grid lines
    for (let i = 1; i < gridSize; i++) {
      const { x, y } = gridToCanvas(i, 0);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + gridHeight);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let i = 1; i < gridSize; i++) {
      const { x, y } = gridToCanvas(0, i);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + gridWidth, y);
      ctx.stroke();
    }
    
    // Draw laser dots - positioned halfway between gridlines
    ctx.fillStyle = 'black';
    
    // Helper to draw dots
    const drawDot = (x, y) => {
      const canvasCoord = gridToCanvas(x, y);
      ctx.beginPath();
      ctx.arc(canvasCoord.x, canvasCoord.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    };
    
    // Draw all laser positions
    getAllLaserPositions().forEach(pos => {
      drawDot(pos.x, pos.y);
    });
    
    // Draw clue values
    ctx.font = '14px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    
    laserClues.forEach(clue => {
      const { x, y, value } = clue;
      const canvasCoord = gridToCanvas(x, y);
      
      // Position text based on edge
      let textX = canvasCoord.x;
      let textY = canvasCoord.y;
      
      if (y === 0) { // Top edge
        textY -= 15;
      } else if (x === 10) { // Right edge
        textX += 20;
      } else if (y === 10) { // Bottom edge
        textY += 20;
      } else if (x === 0) { // Left edge
        textX -= 20;
      }
      
      ctx.fillText(String(value), textX, textY);
    });
    
    // Draw mirrors
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    
    for (let x = 0.5; x < 10; x++) {
      for (let y = 0.5; y < 10; y++) {
        const cellState = getGridValue(x, y);
        const canvasCoord = gridToCanvas(x, y);
        
        if (cellState === 1) { // \ mirror
          ctx.beginPath();
          // Draw from top-left to bottom-right intersections of this cell
          ctx.moveTo(canvasCoord.x - cellSize/2, canvasCoord.y - cellSize/2);
          ctx.lineTo(canvasCoord.x + cellSize/2, canvasCoord.y + cellSize/2);
          ctx.stroke();
        } else if (cellState === 2) { // / mirror
          ctx.beginPath();
          // Draw from top-right to bottom-left intersections of this cell
          ctx.moveTo(canvasCoord.x + cellSize/2, canvasCoord.y - cellSize/2);
          ctx.lineTo(canvasCoord.x - cellSize/2, canvasCoord.y + cellSize/2);
          ctx.stroke();
        }
      }
    }
  }, [grid]);
  
  // Draw laser paths
  useEffect(() => {
    const canvas = laserCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, totalWidth, totalHeight);
    
    // Track current products for each laser
    const currentProducts = {};
    
    if (laserVisibility === 0) {
      return; // Don't draw any lasers
    }
    
    // Convert grid coordinates to canvas coordinates
    const gridToCanvas = (x, y) => ({
      x: borderSize + x * cellSize,
      y: borderSize + y * cellSize
    });
    
    const laserPaths = calculateLaserPaths();
    
    // Draw each laser path
    laserPaths.forEach(laserPath => {
      const { path, startX, startY, product, clueValue } = laserPath;
      
      // Store product for this position
      const key = `${startX},${startY}`;
      currentProducts[key] = product;
      
      // Choose color based on whether the product matches the clue
      let color;
      if (clueValue === null || clueValue === undefined) {
        color = 'rgba(0, 0, 255, 0.5)'; // Blue for unnumbered lasers
      } else if (product === clueValue) {
        color = 'rgba(0, 255, 0, 0.5)'; // Green for matching
      } else {
        color = 'rgba(255, 0, 0, 0.5)'; // Red for non-matching
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      // Starting point coordinates
      const startCoord = gridToCanvas(startX, startY);
      
      ctx.beginPath();
      ctx.moveTo(startCoord.x, startCoord.y);
      
      // Draw each path segment
      path.forEach(point => {
        const canvasCoord = gridToCanvas(point.x, point.y);
        
        // Only draw if point is within or on the boundary of the grid
        if (point.x >= 0 && point.x <= 10 && point.y >= 0 && point.y <= 10) {
          ctx.lineTo(canvasCoord.x, canvasCoord.y);
        }
      });
      
      ctx.stroke();
    });
    
        // Draw current product values next to clues
        ctx.font = '12px Arial';
        ctx.fillStyle = 'purple';
        ctx.textAlign = 'center';
        
        laserClues.forEach(clue => {
          const { x, y, value } = clue;
          const canvasCoord = gridToCanvas(x, y);
          
          const key = `${x},${y}`;
          const currentProduct = currentProducts[key];
          
          if (currentProduct !== undefined) {
            // Position text for current product - slightly offset from the clue value
            let productX = canvasCoord.x;
            let productY = canvasCoord.y;
            
            if (y === 0) { // Top edge
              productY -= 30;
            } else if (x === 10) { // Right edge
              productX += 35;
            } else if (y === 10) { // Bottom edge
              productY += 35;
            } else if (x === 0) { // Left edge
              productX -= 35;
            }
            
            ctx.fillText(`${currentProduct}`, productX, productY);
          }
        });
  }, [grid, laserVisibility]);
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
        <canvas
          ref={gridCanvasRef}
          width={totalWidth}
          height={totalHeight}
          className="absolute top-0 left-0"
        />
        <canvas
          ref={laserCanvasRef}
          width={totalWidth}
          height={totalHeight}
          className="absolute top-0 left-0"
          style={{ pointerEvents: 'none' }}
        />
        <div
          className="absolute top-0 left-0"
          style={{
            width: totalWidth,
            height: totalHeight
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert to grid coordinates
            const gridX = (x - borderSize) / cellSize;
            const gridY = (y - borderSize) / cellSize;
            
            // Find the cell center (not intersection)
            const cellX = Math.floor(gridX) + 0.5;
            const cellY = Math.floor(gridY) + 0.5;
            
            // Check if within bounds of cells
            if (cellX >= 0.5 && cellX < 10 && cellY >= 0.5 && cellY < 10) {
              toggleCell(cellX, cellY);
            }
          }}
        />
      </div>
      
      <div className="flex gap-4 mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={toggleLaserVisibility}
        >
          {laserVisibility === 0 
            ? "Show All Lasers" 
            : laserVisibility === 1 
              ? "Show Only Numbered Lasers" 
              : "Hide All Lasers"}
        </button>
        
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            // Reset grid
            const newGrid = {};
            for (let x = 0.5; x < 10; x++) {
              for (let y = 0.5; y < 10; y++) {
                newGrid[`${x},${y}`] = 0;
              }
            }
            setGrid(newGrid);
          }}
        >
          Clear Grid
        </button>
      </div>
      
      <div className="mt-4 text-gray-700">
        <p>Click on a grid square to cycle through: Empty → \ Mirror → / Mirror</p>
        <p>Green laser path = product matches clue, Red = does not match</p>
      </div>
    </div>
  );
};

export default LaserMirrorPuzzle;
