"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Pencil,
  Brush,
  Pen,
  Eraser,
  Minus,
  Square,
  Circle,
  Triangle,
  Palette,
  RotateCcw,
  RotateCw,
  Download,
  Share,
  Trash2,
  Home,
  ZoomIn,
  ZoomOut,
  Move,
  Droplets,
  Eye,
  MousePointer,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Copy,
} from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Tool =
  | "select"
  | "pencil"
  | "brush"
  | "pen"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "triangle"
  | "fill"
  | "pan"
  | "text"
type BrushStyle = "round" | "square" | "splatter" | "textured"
type MonkeyState = "idle" | "drawing" | "colorPicking" | "erasing" | "celebrating" | "confused" | "thinking" | "typing"
type FillMode = "stroke" | "fill" | "both"
type TextAlign = "left" | "center" | "right"

interface DrawnElement {
  id: string
  type: Tool
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  strokeWidth: number
  fillColor?: string
  fillMode: FillMode
  opacity: number
  selected?: boolean
  // Text specific properties
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  textAlign?: TextAlign
  // Path data for freehand drawing
  path?: { x: number; y: number }[]
  // Tool-specific properties
  texture?: string
  pressure?: number[]
}

interface CanvasPreset {
  name: string
  width: number
  height: number
  category: string
}

const canvasPresets: CanvasPreset[] = [
  { name: "Instagram Post", width: 1080, height: 1080, category: "Social Media" },
  { name: "Instagram Story", width: 1080, height: 1920, category: "Social Media" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, category: "Video" },
  { name: "Facebook Cover", width: 820, height: 312, category: "Social Media" },
  { name: "Twitter Post", width: 1200, height: 675, category: "Social Media" },
  { name: "A4 Portrait", width: 2480, height: 3508, category: "Print" },
  { name: "A4 Landscape", width: 3508, height: 2480, category: "Print" },
  { name: "HD Canvas", width: 1920, height: 1080, category: "Standard" },
  { name: "4K Canvas", width: 3840, height: 2160, category: "Standard" },
]

const colors = [
  "#FF6B35",
  "#F7931E",
  "#FFD23F",
  "#06FFA5",
  "#118AB2",
  "#073B4C",
  "#EF476F",
  "#FFD166",
  "#06D6A0",
  "#8338EC",
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#C0C0C0",
]

const fontFamilies = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
  "Impact",
  "Comic Sans MS",
  "Trebuchet MS",
  "Palatino",
]

const motivationalMessages = [
  "Perfect precision! 🎯",
  "Amazing technique! 🎨",
  "You're so creative! ✨",
  "Beautiful work! 🔥",
  "Keep going, artist! 🎭",
  "Masterpiece in progress! 🌟",
  "So talented! 💫",
  "Love those shapes! 🎪",
  "Fantastic! 🎯",
  "Pure artistry! 🖼️",
]

export default function MonkeyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("brush")
  const [brushStyle, setBrushStyle] = useState<BrushStyle>("round")
  const [brushSize, setBrushSize] = useState(10)
  const [opacity, setOpacity] = useState(100)
  const [currentColor, setCurrentColor] = useState("#FF6B35")
  const [fillColor, setFillColor] = useState("#FFD23F")
  const [fillMode, setFillMode] = useState<FillMode>("stroke")
  const [fillTolerance, setFillTolerance] = useState(10)
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)

  // Text tool state
  const [isTyping, setIsTyping] = useState(false)
  const [currentText, setCurrentText] = useState("")
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontWeight, setFontWeight] = useState("normal")
  const [fontStyle, setFontStyle] = useState("normal")
  const [textDecoration, setTextDecoration] = useState("none")
  const [textAlign, setTextAlign] = useState<TextAlign>("left")
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null)

  // Canvas state
  const [zoom, setZoom] = useState(0.4) // Start more zoomed out
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 })
  const [selectedPreset, setSelectedPreset] = useState("HD Canvas")

  // Drawing elements
  const [elements, setElements] = useState<DrawnElement[]>([])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])

  // UI state
  const [monkeyState, setMonkeyState] = useState<MonkeyState>("idle")
  const [motivationalText, setMotivationalText] = useState("")
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [showCanvasPresets, setShowCanvasPresets] = useState(false)
  const [showTextControls, setShowTextControls] = useState(false)

  // History
  const [history, setHistory] = useState<DrawnElement[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Drawing state
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // --- DRAGGING STATE FOR ALL ELEMENTS ---
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingElement, setIsDraggingElement] = useState(false)

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...elements])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [elements, history, historyIndex])

  // Initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current
    const previewCanvas = previewCanvasRef.current
    if (!canvas || !previewCanvas) return

    const ctx = canvas.getContext("2d")
    const previewCtx = previewCanvas.getContext("2d")
    if (!ctx || !previewCtx) return

    // Set canvas sizes
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    previewCanvas.width = canvasSize.width
    previewCanvas.height = canvasSize.height

    // Initialize main canvas
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    
    // Set initial white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add initial white background to elements array
    if (elements.length === 0) {
      setElements([{
        id: "background",
        type: "rectangle",
        startX: 0,
        startY: 0,
        endX: canvas.width,
        endY: canvas.height,
        color: "white",
        strokeWidth: 0,
        fillColor: "white",
        fillMode: "fill",
        opacity: 100
      }])
    }

    // Initialize preview canvas
    previewCtx.lineCap = "round"
    previewCtx.lineJoin = "round"

    // Save initial state
    if (history.length === 0) {
      setHistory([[]])
      setHistoryIndex(0)
    }
  }, [canvasSize])

  // Show motivational message
  const showMotivationalMessage = () => {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    setMotivationalText(message)
    setTimeout(() => setMotivationalText(""), 3000)
  }

  // Get accurate mouse/touch position
  const getEventPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const x = (clientX - rect.left) / zoom - panX
    const y = (clientY - rect.top) / zoom - panY

    return { x, y }
  }

  // Apply tool-specific drawing styles
  const applyToolStyle = (ctx: CanvasRenderingContext2D, toolType: Tool, isMainStroke = true) => {
    ctx.globalAlpha = opacity / 100
    ctx.strokeStyle = currentColor
    ctx.lineWidth = brushSize

    switch (toolType) {
      case "pencil":
        // Hard-edged, sketchy strokes with texture and grain
        ctx.lineCap = "round"
        ctx.lineJoin = "round" 
        ctx.globalCompositeOperation = "source-over"
        ctx.shadowBlur = 0
        
        // Make pencil strokes rougher and less opaque
        if (isMainStroke) {
          ctx.lineWidth = Math.max(1, brushSize * 0.8)
          ctx.globalAlpha = (opacity / 100) * 0.7 // More transparent for pencil effect
        }
        break

      case "brush":
        // Soft, painterly strokes with natural variation and texture
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.globalCompositeOperation = "source-over"
        
        // Add soft blur effect for painterly look
        ctx.shadowColor = currentColor
        ctx.shadowBlur = brushSize * 0.2
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Natural brush width variation
        if (isMainStroke) {
          const variation = (Math.random() - 0.5) * brushSize * 0.3
          ctx.lineWidth = Math.max(1, brushSize + variation)
          ctx.globalAlpha = (opacity / 100) * (0.9 + Math.random() * 0.1) // Slight opacity variation
        }
        break

      case "pen":
        // Smooth, consistent ink-like strokes
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.globalCompositeOperation = "source-over"
        ctx.lineWidth = Math.max(0.5, brushSize * 0.6) // Thinner and more precise
        ctx.globalAlpha = Math.min(1, (opacity / 100) * 1.2) // Higher opacity for ink effect
        ctx.shadowBlur = 0 // No blur for clean vector look
        break

      default:
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.shadowBlur = 0
        break
    }
  }

  // Enhanced drawing function with tool-specific effects
  const drawToolStroke = (ctx: CanvasRenderingContext2D, path: { x: number; y: number }[], toolType: Tool, strokeWidth: number, color: string, opacity: number) => {
    if (path.length < 2) return

    ctx.save()
    
    switch (toolType) {
      case "eraser":
        // Eraser: Paint solid white with no borders
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 1.0
        ctx.strokeStyle = "white"
        ctx.fillStyle = "white"
        ctx.lineWidth = strokeWidth * 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.shadowBlur = 0
        ctx.shadowColor = "transparent"
        
        // Create path
        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        
        // Draw smooth curve through points
        for (let i = 1; i < path.length - 2; i++) {
          const xc = (path[i].x + path[i + 1].x) / 2
          const yc = (path[i].y + path[i + 1].y) / 2
          ctx.quadraticCurveTo(path[i].x, path[i].y, xc, yc)
        }
        
        // Handle last two points
        if (path.length > 2) {
          ctx.quadraticCurveTo(
            path[path.length - 2].x,
            path[path.length - 2].y,
            path[path.length - 1].x,
            path[path.length - 1].y
          )
        }
        
        // Both stroke and fill to ensure complete coverage
        ctx.stroke()
        ctx.lineTo(path[0].x, path[0].y) // Close the path
        ctx.fill() // Fill the path to ensure no borders
        break

      case "pencil":
        // Pencil: Multiple overlapping strokes for texture
        ctx.globalAlpha = (opacity / 100) * 0.6
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth * 0.8
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        
        // Main stroke
        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        path.forEach((point, index) => {
          if (index > 0) {
            // Add slight randomness for pencil texture
            const jitter = 0.5
            const x = point.x + (Math.random() - 0.5) * jitter
            const y = point.y + (Math.random() - 0.5) * jitter
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
        
        // Add texture lines for pencil grain effect
        ctx.globalAlpha = (opacity / 100) * 0.3
        ctx.lineWidth = Math.max(0.5, strokeWidth * 0.3)
        for (let i = 0; i < path.length - 1; i += 3) {
          const point = path[i]
          const nextPoint = path[i + 1] || point
          ctx.beginPath()
          ctx.moveTo(point.x + Math.random() * 2 - 1, point.y + Math.random() * 2 - 1)
          ctx.lineTo(nextPoint.x + Math.random() * 2 - 1, nextPoint.y + Math.random() * 2 - 1)
          ctx.stroke()
        }
        break

      case "brush":
        // Brush: Varying width and soft edges
        ctx.strokeStyle = color
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.shadowColor = color
        ctx.shadowBlur = strokeWidth * 0.3
        
        // Create brush stroke with varying width
        for (let i = 0; i < path.length - 1; i++) {
          const current = path[i]
          const next = path[i + 1]
          
          // Calculate pressure simulation based on speed
          const distance = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2))
          const pressure = Math.max(0.3, Math.min(1, 10 / (distance + 1)))
          
          ctx.globalAlpha = (opacity / 100) * (0.7 + pressure * 0.3)
          ctx.lineWidth = strokeWidth * (0.5 + pressure * 0.5)
          
          ctx.beginPath()
          ctx.moveTo(current.x, current.y)
          ctx.lineTo(next.x, next.y)
          ctx.stroke()
        }
        
        // Add brush texture dots
        if (brushStyle === "splatter" || brushStyle === "textured") {
          ctx.shadowBlur = 0
          path.forEach((point, index) => {
            if (index % 4 === 0) {
              for (let i = 0; i < 2; i++) {
                const offsetX = (Math.random() - 0.5) * strokeWidth * 0.8
                const offsetY = (Math.random() - 0.5) * strokeWidth * 0.8
                const size = Math.random() * strokeWidth * 0.15 + 0.5
                ctx.globalAlpha = (opacity / 100) * (0.3 + Math.random() * 0.4)
                ctx.beginPath()
                ctx.arc(point.x + offsetX, point.y + offsetY, size, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          })
        }
        break

      case "pen":
        // Pen: Smooth, consistent ink flow
        ctx.globalAlpha = Math.min(1, (opacity / 100) * 1.1)
        ctx.strokeStyle = color
        ctx.lineWidth = Math.max(0.5, strokeWidth * 0.6)
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.shadowBlur = 0
        
        // Smooth bezier curves for pen
        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        
        if (path.length === 2) {
          ctx.lineTo(path[1].x, path[1].y)
        } else {
          for (let i = 1; i < path.length - 1; i++) {
            const current = path[i]
            const next = path[i + 1]
            const cpx = (current.x + next.x) / 2
            const cpy = (current.y + next.y) / 2
            ctx.quadraticCurveTo(current.x, current.y, cpx, cpy)
          }
          // Final point
          ctx.lineTo(path[path.length - 1].x, path[path.length - 1].y)
        }
        ctx.stroke()
        break

      default:
        // Fallback to simple line drawing
        ctx.globalAlpha = opacity / 100
        ctx.strokeStyle = color
        ctx.lineWidth = strokeWidth
        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        path.forEach(point => ctx.lineTo(point.x, point.y))
        ctx.stroke()
        break
    }
    
    ctx.restore()
  }

  // Draw element on canvas
  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawnElement, isPreview = false) => {
    ctx.save()
    ctx.globalAlpha = (element.opacity || 100) / 100

    if (element.type === "text" && element.text) {
      // Draw text
      ctx.fillStyle = element.color
      ctx.font = `${element.fontStyle || "normal"} ${element.fontWeight || "normal"} ${
        element.fontSize || 24
      }px ${element.fontFamily || "Arial"}`
      ctx.textAlign = element.textAlign || "left"
      ctx.textBaseline = "top"

      const lines = element.text.split("\n")
      lines.forEach((line, index) => {
        const y = element.startY + index * (element.fontSize || 24) * 1.2
        ctx.fillText(line, element.startX, y)

        // Add text decorations
        if (element.textDecoration === "underline") {
          const metrics = ctx.measureText(line)
          ctx.beginPath()
          ctx.moveTo(element.startX, y + (element.fontSize || 24))
          ctx.lineTo(element.startX + metrics.width, y + (element.fontSize || 24))
          ctx.strokeStyle = element.color
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    } else if (element.path && element.path.length > 1) {
      // Draw freehand path using tool-specific effects
      drawToolStroke(ctx, element.path, element.type, element.strokeWidth, element.color, element.opacity || 100)
    } else {
      // Draw shapes
      ctx.strokeStyle = element.color
      ctx.lineWidth = element.strokeWidth

      if (element.fillColor && (element.fillMode === "fill" || element.fillMode === "both")) {
        ctx.fillStyle = element.fillColor
      }

      ctx.beginPath()

      switch (element.type) {
        case "line":
          ctx.moveTo(element.startX, element.startY)
          ctx.lineTo(element.endX, element.endY)
          break

        case "rectangle":
          const width = element.endX - element.startX
          const height = element.endY - element.startY
          ctx.rect(element.startX, element.startY, width, height)
          break

        case "circle":
          const centerX = (element.startX + element.endX) / 2
          const centerY = (element.startY + element.endY) / 2
          const radius =
            Math.sqrt(Math.pow(element.endX - element.startX, 2) + Math.pow(element.endY - element.startY, 2)) / 2
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
          break

        case "triangle":
          const midX = (element.startX + element.endX) / 2
          ctx.moveTo(midX, element.startY)
          ctx.lineTo(element.endX, element.endY)
          ctx.lineTo(element.startX, element.endY)
          ctx.closePath()
          break
      }

      // Fill and stroke
      if (element.fillColor && (element.fillMode === "fill" || element.fillMode === "both")) {
        ctx.fill()
      }
      if (element.fillMode === "stroke" || element.fillMode === "both") {
        ctx.stroke()
      }
    }

    // Draw selection handles if selected
    if (element.selected && !isPreview) {
      drawSelectionHandles(ctx, element)
    }
    
    // Add visual feedback when dragging
    if (element.id === draggingElementId && isDraggingElement && !isPreview) {
      ctx.save()
      ctx.globalAlpha = 0.5
      ctx.strokeStyle = "#FF6B35"
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      
      // Draw dashed outline around dragged element
      if (element.type === "text" && element.text) {
        ctx.font = `${element.fontStyle || "normal"} ${element.fontWeight || "normal"} ${
          element.fontSize || 24
        }px ${element.fontFamily || "Arial"}`
        const metrics = ctx.measureText(element.text)
        ctx.strokeRect(element.startX - 5, element.startY - 5, metrics.width + 10, (element.fontSize || 24) + 10)
      } else if (element.type === "circle") {
        const centerX = (element.startX + element.endX) / 2
        const centerY = (element.startY + element.endY) / 2
        const radius = Math.sqrt(Math.pow(element.endX - element.startX, 2) + Math.pow(element.endY - element.startY, 2)) / 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        const minX = Math.min(element.startX, element.endX) - 5
        const minY = Math.min(element.startY, element.endY) - 5
        const width = Math.abs(element.endX - element.startX) + 10
        const height = Math.abs(element.endY - element.startY) + 10
        ctx.strokeRect(minX, minY, width, height)
      }
      
      ctx.restore()
    }

    ctx.restore()
  }

  // Draw selection handles
  const drawSelectionHandles = (ctx: CanvasRenderingContext2D, element: DrawnElement) => {
    const handleSize = 8 / zoom
    let bounds = { minX: element.startX, minY: element.startY, maxX: element.endX, maxY: element.endY }

    if (element.type === "text" && element.text) {
      // Calculate text bounds
      ctx.font = `${element.fontStyle || "normal"} ${element.fontWeight || "normal"} ${
        element.fontSize || 24
      }px ${element.fontFamily || "Arial"}`
      const textMetrics = ctx.measureText(element.text || "")
      bounds = {
        minX: element.startX,
        minY: element.startY,
        maxX: element.startX + textMetrics.width,
        maxY: element.startY + (element.fontSize || 24),
      }
    }

    ctx.save()
    ctx.fillStyle = "#4A90E2"
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2 / zoom

    // Draw bounding box
    ctx.strokeRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)

    // Corner handles
    const handles = [
      { x: bounds.minX, y: bounds.minY }, // Top-left
      { x: bounds.maxX, y: bounds.minY }, // Top-right
      { x: bounds.maxX, y: bounds.maxY }, // Bottom-right
      { x: bounds.minX, y: bounds.maxY }, // Bottom-left
    ]

    handles.forEach((handle) => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
    })

    ctx.restore()
  }

  // Redraw canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background first (always the first element)
    const backgroundElement = elements[0]
    if (backgroundElement && backgroundElement.id === "background") {
      ctx.fillStyle = backgroundElement.fillColor || "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Draw all other elements
    elements.slice(1).forEach((element) => {
      drawElement(ctx, element)
    })
  }

  // Draw preview
  const drawPreview = () => {
    const previewCanvas = previewCanvasRef.current
    if (!previewCanvas || !startPoint || !currentPoint) return
    const previewCtx = previewCanvas.getContext("2d")
    if (!previewCtx) return

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)

    if (["line", "rectangle", "circle", "triangle"].includes(tool)) {
      const previewElement: DrawnElement = {
        id: "preview",
        type: tool,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: currentPoint.x,
        endY: currentPoint.y,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: fillMode !== "stroke" ? fillColor : undefined,
        fillMode,
        opacity: 70,
      }
      drawElement(previewCtx, previewElement, true)
    }
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getEventPos(e)

    if (tool === "text") {
      setTextPosition(pos)
      setIsTyping(true)
      setMonkeyState("typing")
      setShowTextControls(true)
      setTimeout(() => textInputRef.current?.focus(), 100)
      return
    }

    if (tool === "pan") {
      setIsDrawing(true)
      setStartPoint(pos)
      return
    }

    if (tool === "select") {
      // Don't allow selecting the background element
      const clickedElement = elements.slice(1).find((element) => isPointInElement(pos, element))
      
      if (!e.shiftKey) {
        setElements((prev) => prev.map((el) => ({ ...el, selected: false })))
        setSelectedElements([])
      }

      if (clickedElement) {
        setElements((prev) => prev.map((el) => (el.id === clickedElement.id ? { ...el, selected: true } : el)))
        setSelectedElements((prev) => [...prev, clickedElement.id])
        setIsDrawing(true)
        setIsDraggingElement(true)
        setDraggingElementId(clickedElement.id)
        setDragOffset({ x: pos.x - clickedElement.startX, y: pos.y - clickedElement.startY })
      }

      redrawCanvas()
      return
    }

    setIsDrawing(true)
    setStartPoint(pos)
    setCurrentPoint(pos)
    setIsDragging(false)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Handle drawing tools
    if (["pencil", "brush", "pen", "eraser"].includes(tool)) {
      setMonkeyState(tool === "eraser" ? "erasing" : "drawing")
      applyToolStyle(ctx, tool)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      setCurrentPath([pos])
    } else if (tool === "fill") {
      // Update background color when using fill tool
      if (elements[0]?.id === "background") {
        setElements(prev => [
          { ...prev[0], fillColor: fillColor },
          ...prev.slice(1)
        ])
      }
      setMonkeyState("celebrating")
      setTimeout(() => setMonkeyState("idle"), 1500)
      saveToHistory()
    }

    showMotivationalMessage()
  }

  // Continue drawing
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !startPoint) return

    const pos = getEventPos(e)
    setCurrentPoint(pos)
    setIsDragging(true)

    if (tool === "pan") {
      const deltaX = pos.x - startPoint.x
      const deltaY = pos.y - startPoint.y
      setPanX((prev) => prev + deltaX)
      setPanY((prev) => prev + deltaY)
      return
    }

    // --- DRAG ANY ELEMENT ---
    if (tool === "select" && isDraggingElement && draggingElementId && dragOffset) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== draggingElementId) return el
          
          const newX = pos.x - dragOffset.x
          const newY = pos.y - dragOffset.y
          
          if (el.type === "text") {
            // For text, just move the start position
            return {
              ...el,
              startX: newX,
              startY: newY,
              endX: newX,
              endY: newY,
            }
          }
          
          if (el.type === "circle") {
            // For circles, move the center while maintaining radius
            const currentCenterX = (el.startX + el.endX) / 2
            const currentCenterY = (el.startY + el.endY) / 2
            const radiusX = (el.endX - el.startX) / 2
            const radiusY = (el.endY - el.startY) / 2
            
            const newCenterX = pos.x - dragOffset.x
            const newCenterY = pos.y - dragOffset.y
            
            return {
              ...el,
              startX: newCenterX - radiusX,
              startY: newCenterY - radiusY,
              endX: newCenterX + radiusX,
              endY: newCenterY + radiusY,
            }
          }
          
          if (el.path && el.path.length > 0) {
            // For path elements (pencil, brush, pen), move all path points
            const deltaX = newX - el.startX
            const deltaY = newY - el.startY
            
            return {
              ...el,
              startX: newX,
              startY: newY,
              endX: el.endX + deltaX,
              endY: el.endY + deltaY,
              path: el.path.map(point => ({
                x: point.x + deltaX,
                y: point.y + deltaY,
              })),
            }
          }
          
          // For other shapes (rectangle, triangle, line), move both start and end points
          const deltaX = newX - el.startX
          const deltaY = newY - el.startY
          
          return {
            ...el,
            startX: newX,
            startY: newY,
            endX: el.endX + deltaX,
            endY: el.endY + deltaY,
          }
        })
      )
      redrawCanvas()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (["pencil", "brush", "pen", "eraser"].includes(tool)) {
      setCurrentPath((prev) => {
        const newPath = [...prev, pos]
        const prevPoint = prev[prev.length - 1]
        
        // Save context state
        ctx.save()
        
        // Basic setup
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        
        // Handle first point
        if (!prevPoint) {
          if (tool === "eraser") {
            ctx.globalCompositeOperation = "source-over"
            ctx.fillStyle = "white"
            ctx.globalAlpha = 1.0
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.globalCompositeOperation = "source-over"
            ctx.fillStyle = currentColor
            ctx.globalAlpha = opacity / 100
            ctx.beginPath()
            ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
          return newPath
        }

        // Handle eraser
        if (tool === "eraser") {
          ctx.globalCompositeOperation = "source-over"
          ctx.strokeStyle = "white"
          ctx.fillStyle = "white"
          ctx.globalAlpha = 1.0
          ctx.lineWidth = brushSize * 2
          ctx.beginPath()
          ctx.moveTo(prevPoint.x, prevPoint.y)
          ctx.lineTo(pos.x, pos.y)
          ctx.stroke()
          ctx.restore()
          return newPath
        }

        // For drawing tools
        ctx.globalCompositeOperation = "source-over"
        
        switch (tool) {
          case "pencil": {
            // Pencil: sketchy, textured strokes
            ctx.globalAlpha = (opacity / 100) * 0.7
            ctx.strokeStyle = currentColor
            ctx.lineWidth = Math.max(1, brushSize * 0.8)
            ctx.shadowBlur = 0
            
            // Add slight jitter for pencil texture
            const jitter = 0.3
            const x = pos.x + (Math.random() - 0.5) * jitter
            const y = pos.y + (Math.random() - 0.5) * jitter
            
            // Main stroke
            ctx.beginPath()
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(x, y)
            ctx.stroke()
            
            // Occasional texture strokes
            if (Math.random() > 0.7) {
              ctx.globalAlpha = (opacity / 100) * 0.3
              ctx.lineWidth = Math.max(0.5, brushSize * 0.3)
              ctx.beginPath()
              ctx.moveTo(prevPoint.x + (Math.random() - 0.5), prevPoint.y + (Math.random() - 0.5))
              ctx.lineTo(x + (Math.random() - 0.5), y + (Math.random() - 0.5))
              ctx.stroke()
            }
            break
          }
          
          case "brush": {
            // Brush: soft, pressure-sensitive strokes
            const distance = Math.sqrt(Math.pow(pos.x - prevPoint.x, 2) + Math.pow(pos.y - prevPoint.y, 2))
            const pressure = Math.max(0.3, Math.min(1, 8 / (distance + 1)))
            
            ctx.globalAlpha = (opacity / 100) * (0.7 + pressure * 0.3)
            ctx.strokeStyle = currentColor
            ctx.lineWidth = brushSize * (0.5 + pressure * 0.5)
            
            // Soft edges
            ctx.shadowColor = currentColor
            ctx.shadowBlur = brushSize * 0.2
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
            
            // Main stroke
            ctx.beginPath()
            ctx.moveTo(prevPoint.x, prevPoint.y)
            ctx.lineTo(pos.x, pos.y)
            ctx.stroke()
            
            // Add splatter for textured brush
            if (brushStyle === "splatter" && Math.random() > 0.8) {
              ctx.shadowBlur = 0
              ctx.fillStyle = currentColor
              const dotSize = Math.random() * brushSize * 0.3
              ctx.globalAlpha = (opacity / 100) * 0.4
              ctx.beginPath()
              ctx.arc(
                pos.x + (Math.random() - 0.5) * brushSize,
                pos.y + (Math.random() - 0.5) * brushSize,
                dotSize,
                0,
                Math.PI * 2
              )
              ctx.fill()
            }
            break
          }
          
          case "pen": {
            // Pen: smooth, precise lines
            ctx.globalAlpha = Math.min(1, (opacity / 100) * 1.1)
            ctx.strokeStyle = currentColor
            ctx.lineWidth = Math.max(0.5, brushSize * 0.6)
            ctx.shadowBlur = 0
            
            // Smooth line with quadratic curve
            ctx.beginPath()
            ctx.moveTo(prevPoint.x, prevPoint.y)
            const midX = (prevPoint.x + pos.x) / 2
            const midY = (prevPoint.y + pos.y) / 2
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
            ctx.lineTo(pos.x, pos.y)
            ctx.stroke()
            break
          }
        }
        
        ctx.restore()
        return newPath
      })
    } else if (["line", "rectangle", "circle", "triangle"].includes(tool)) {
      drawPreview()
    }
  }

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    // Clean up dragging state
    if (isDraggingElement) {
      setIsDraggingElement(false)
      setDraggingElementId(null)
      setDragOffset(null)
      saveToHistory() // Save the new position to history
      return
    }
    
    setDraggingElementId(null)
    setDragOffset(null)

    if (tool === "pan") {
      setStartPoint(null)
      return
    }

    if (!startPoint || !currentPoint) return

    // Create new element
    if (["pencil", "brush", "pen", "eraser"].includes(tool) && currentPath.length > 1) {
      const newElement: DrawnElement = {
        id: Date.now().toString(),
        type: tool,
        startX: currentPath[0].x,
        startY: currentPath[0].y,
        endX: currentPath[currentPath.length - 1].x,
        endY: currentPath[currentPath.length - 1].y,
        color: tool === "eraser" ? "white" : currentColor, // Eraser always uses white
        strokeWidth: tool === "eraser" ? brushSize * 2 : brushSize, // Eraser is thicker
        opacity: tool === "eraser" ? 100 : opacity, // Eraser is always full opacity
        fillMode: "stroke",
        path: [...currentPath],
      }
      setElements((prev) => [...prev, newElement])
    } else if (["line", "rectangle", "circle", "triangle"].includes(tool) && isDragging) {
      const newElement: DrawnElement = {
        id: Date.now().toString(),
        type: tool,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: currentPoint.x,
        endY: currentPoint.y,
        color: currentColor,
        strokeWidth: brushSize,
        fillColor: fillMode !== "stroke" ? fillColor : undefined,
        fillMode,
        opacity,
      }
      setElements((prev) => [...prev, newElement])
      setMonkeyState("celebrating")
      setTimeout(() => setMonkeyState("idle"), 1500)

      // Clear preview
      const previewCanvas = previewCanvasRef.current
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext("2d")
        if (previewCtx) {
          previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
        }
      }
    } else {
      setMonkeyState("idle")
    }

    setStartPoint(null)
    setCurrentPoint(null)
    setIsDragging(false)
    setCurrentPath([])
    saveToHistory()
  }

  // Check if point is inside element (improved for all element types)
  const isPointInElement = (point: { x: number; y: number }, element: DrawnElement): boolean => {
    const tolerance = 10 // Pixels tolerance for easier selection

    if (element.type === "text") {
      // Text bounds check
      const canvas = canvasRef.current
      if (!canvas) return false
      const ctx = canvas.getContext("2d")
      if (!ctx) return false

      ctx.font = `${element.fontStyle || "normal"} ${element.fontWeight || "normal"} ${
        element.fontSize || 24
      }px ${element.fontFamily || "Arial"}`
      const elementMetrics = ctx.measureText(element.text || "")

      return (
        point.x >= element.startX - tolerance &&
        point.x <= element.startX + elementMetrics.width + tolerance &&
        point.y >= element.startY - tolerance &&
        point.y <= element.startY + (element.fontSize || 24) + tolerance
      )
    }

    if (element.path && element.path.length > 0) {
      // For freehand drawings (pencil, brush, pen), check if point is near the path
      return element.path.some(pathPoint => {
        const distance = Math.sqrt(
          Math.pow(point.x - pathPoint.x, 2) + Math.pow(point.y - pathPoint.y, 2)
        )
        return distance <= tolerance + (element.strokeWidth || 5)
      })
    }

    if (element.type === "circle") {
      // Circle bounds check
      const centerX = (element.startX + element.endX) / 2
      const centerY = (element.startY + element.endY) / 2
      const radius = Math.sqrt(
        Math.pow(element.endX - element.startX, 2) + Math.pow(element.endY - element.startY, 2)
      ) / 2
      const distance = Math.sqrt(
        Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
      )
      return distance <= radius + tolerance
    }

    if (element.type === "line") {
      // Line proximity check
      const A = element.startX
      const B = element.startY
      const C = element.endX
      const D = element.endY
      const px = point.x
      const py = point.y
      
      // Distance from point to line
      const lineLength = Math.sqrt((C - A) * (C - A) + (D - B) * (D - B))
      if (lineLength === 0) return false
      
      const distance = Math.abs((D - B) * px - (C - A) * py + C * B - D * A) / lineLength
      return distance <= tolerance + (element.strokeWidth || 5)
    }

    // Rectangle and triangle bounds check with tolerance
    const minX = Math.min(element.startX, element.endX) - tolerance
    const maxX = Math.max(element.startX, element.endX) + tolerance
    const minY = Math.min(element.startY, element.endY) - tolerance
    const maxY = Math.max(element.startY, element.endY) + tolerance

    return (
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    )
  }

  // Add text to canvas
  const addText = () => {
    if (!textPosition || !currentText.trim()) return

    const newElement: DrawnElement = {
      id: Date.now().toString(),
      type: "text",
      startX: textPosition.x,
      startY: textPosition.y,
      endX: textPosition.x,
      endY: textPosition.y,
      color: currentColor,
      strokeWidth: 0,
      opacity,
      fillMode: "fill",
      text: currentText,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textDecoration,
      textAlign,
    }

    setElements((prev) => [...prev, newElement])
    setCurrentText("")
    setIsTyping(false)
    setTextPosition(null)
    setMonkeyState("idle")
    setShowTextControls(false)
    saveToHistory()
  }

  // Cancel text input
  const cancelText = () => {
    setCurrentText("")
    setIsTyping(false)
    setTextPosition(null)
    setMonkeyState("idle")
    setShowTextControls(false)
  }

  // Change canvas preset
  const changeCanvasPreset = (presetName: string) => {
    const preset = canvasPresets.find((p) => p.name === presetName)
    if (preset) {
      setCanvasSize({ width: preset.width, height: preset.height })
      setSelectedPreset(presetName)
      setShowCanvasPresets(false)
      // Reset zoom and pan
      setZoom(0.3)
      setPanX(0)
      setPanY(0)
    }
  }

  // Redraw when elements change
  useEffect(() => {
    redrawCanvas()
  }, [elements])

  // Flood fill implementation (bucket fill)
  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColorHex: string) => {
    const canvas = ctx.canvas
    const width = canvas.width
    const height = canvas.height
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Convert hex color to RGBA
    const hexToRgba = (hex: string) => {
      let c = hex.replace('#', '')
      if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2]
      const num = parseInt(c, 16)
      return [
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255,
        255
      ]
    }
    const fillColor = hexToRgba(fillColorHex)

    // Get the color at the starting pixel
    const getPixel = (x: number, y: number) => {
      const i = (y * width + x) * 4
      return [data[i], data[i+1], data[i+2], data[i+3]]
    }
    const setPixel = (x: number, y: number, color: number[]) => {
      const i = (y * width + x) * 4
      data[i] = color[0]
      data[i+1] = color[1]
      data[i+2] = color[2]
      data[i+3] = color[3]
    }
    const colorMatch = (a: number[], b: number[], tolerance = fillTolerance) => {
      return (
        Math.abs(a[0] - b[0]) <= tolerance &&
        Math.abs(a[1] - b[1]) <= tolerance &&
        Math.abs(a[2] - b[2]) <= tolerance &&
        Math.abs(a[3] - b[3]) <= tolerance
      )
    }

    const startColor = getPixel(x, y)
    if (colorMatch(startColor, fillColor)) return // Already filled

    const stack: [number, number][] = [[x, y]]
    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!
      if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue
      const currentColor = getPixel(cx, cy)
      if (!colorMatch(currentColor, startColor)) continue
      setPixel(cx, cy, fillColor)
      stack.push([cx + 1, cy])
      stack.push([cx - 1, cy])
      stack.push([cx, cy + 1])
      stack.push([cx, cy - 1])
    }
    ctx.putImageData(imageData, 0, 0)
  }

  // Zoom functions
  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5))
  const zoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1))
  const resetZoom = () => {
    setZoom(0.4)
    setPanX(0)
    setPanY(0)
  }

  // Clear canvas
  const clearCanvas = () => {
    setElements([])
    setSelectedElements([])
    setMonkeyState("confused")
    setTimeout(() => setMonkeyState("idle"), 2000)
    saveToHistory()
  }

  // Undo/Redo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements(history[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements(history[historyIndex + 1])
    }
  }

  // Delete selected elements
  const deleteSelected = () => {
    setElements((prev) => prev.filter((el) => !selectedElements.includes(el.id)))
    setSelectedElements([])
    saveToHistory()
  }

  // Copy selected elements
  const copySelected = () => {
    const selectedEls = elements.filter((el) => selectedElements.includes(el.id))
    if (selectedEls.length > 0) {
      const copies = selectedEls.map((el) => ({
        ...el,
        id: Date.now().toString() + Math.random(),
        startX: el.startX + 20,
        startY: el.startY + 20,
        endX: el.endX + 20,
        endY: el.endY + 20,
        selected: false,
      }))
      setElements((prev) => [...prev, ...copies])
      saveToHistory()
    }
  }

  // Save and share
  const saveImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setMonkeyState("celebrating")
    setTimeout(() => setMonkeyState("idle"), 3000)

    const link = document.createElement("a")
    link.download = "monkey-masterpiece.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  const shareOnTwitter = () => {
    setMonkeyState("celebrating")
    setTimeout(() => setMonkeyState("idle"), 3000)

    const text = "Just created this masterpiece with Monkey Canvas Pro! 🎨🐒 #MonkeyCanvas #DigitalArt #Solana"
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text)
    window.open(url, "_blank")
  }

  // Tool configurations
  const tools = [
    { id: "select", icon: MousePointer, label: "Select", description: "Select and move objects" },
    { id: "pencil", icon: Pencil, label: "Pencil", description: "Hard-edged precise drawing" },
    { id: "brush", icon: Brush, label: "Brush", description: "Soft painterly strokes" },
    { id: "pen", icon: Pen, label: "Pen", description: "Smooth vector-style curves" },
    { id: "eraser", icon: Eraser, label: "Eraser", description: "Remove content" },
    { id: "text", icon: Type, label: "Text", description: "Add and edit text" },
    { id: "line", icon: Minus, label: "Line", description: "Draw straight lines" },
    { id: "rectangle", icon: Square, label: "Rectangle", description: "Draw rectangles" },
    { id: "circle", icon: Circle, label: "Circle", description: "Draw circles" },
    { id: "triangle", icon: Triangle, label: "Triangle", description: "Draw triangles" },
    { id: "fill", icon: Droplets, label: "Fill", description: "Fill areas with color" },
    { id: "pan", icon: Move, label: "Pan", description: "Move around canvas" },
  ]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between max-w-full mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-400/60 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <h1 className="text-2xl lg:text-3xl font-black italic bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                 Monkey Canvas Pro
              </h1>
            </div>

            {/* Canvas Presets */}
            <div className="flex items-center gap-4">
              <Select value={selectedPreset} onValueChange={changeCanvasPreset}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Canvas Size" />
                </SelectTrigger>
                <SelectContent>
                  {canvasPresets.map((preset) => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name} ({preset.width}×{preset.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Bar */}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full font-medium text-xs">
                  {tools.find((t) => t.id === tool)?.label}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-xs">
                  {Math.round(zoom * 100)}%
                </span>
                {selectedElements.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium text-xs">
                    {selectedElements.length} selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Toolbar */}
          <div className="w-20 bg-white shadow-lg border-r flex flex-col items-center py-4 space-y-2">
            {tools.map((toolItem) => (
              <Tooltip key={toolItem.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool === toolItem.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setTool(toolItem.id as Tool)
                      setHoveredElementId(null) // Clear hover state when switching tools
                    }}
                    className={`w-12 h-12 p-0 ${
                      tool === toolItem.id ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    <toolItem.icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-center">
                    <div className="font-medium">{toolItem.label}</div>
                    <div className="text-xs text-gray-500">{toolItem.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            <div className="border-t pt-2 space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={zoomIn} className="w-12 h-12 p-0">
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Zoom In</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={zoomOut} className="w-12 h-12 p-0">
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Zoom Out</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div
              ref={containerRef}
              className="flex-1 relative overflow-hidden bg-gray-200"
              style={{
                backgroundImage: `
                linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
              `,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Main Canvas */}
                  <canvas
                    ref={canvasRef}
                    className="shadow-2xl rounded-lg border-4 border-white"
                    style={{
                      transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                      cursor: 
                        tool === "pan" 
                          ? isDrawing ? "grabbing" : "grab"
                          : tool === "select"
                            ? isDraggingElement 
                              ? "move"
                              : hoveredElementId
                                ? "pointer"
                                : "default"
                            : "crosshair",
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={(e) => {
                      // Handle hover detection for select tool
                      if (tool === "select" && !isDrawing) {
                        const pos = getEventPos(e)
                        const hoveredElement = elements.find((element) => isPointInElement(pos, element))
                        setHoveredElementId(hoveredElement?.id || null)
                      }
                      draw(e)
                    }}
                    onMouseUp={stopDrawing}
                    onMouseLeave={(e) => {
                      setHoveredElementId(null)
                      stopDrawing()
                    }}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />

                  {/* Preview Canvas */}
                  <canvas
                    ref={previewCanvasRef}
                    className="absolute top-0 left-0 pointer-events-none rounded-lg"
                    style={{
                      transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                    }}
                  />

                  {/* Text Input Overlay */}
                  {isTyping && textPosition && (
                    <div
                      className="absolute bg-white border-2 border-orange-400 rounded-lg p-2 shadow-lg"
                      style={{
                        left: textPosition.x * zoom + panX,
                        top: textPosition.y * zoom + panY,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                      }}
                    >
                      <Input
                        ref={textInputRef}
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            addText()
                          } else if (e.key === "Escape") {
                            cancelText()
                          }
                        }}
                        placeholder="Type your text..."
                        className="min-w-48"
                        style={{
                          fontSize: `${fontSize}px`,
                          fontFamily,
                          fontWeight,
                          fontStyle,
                          textDecoration,
                        }}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={addText}>
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelText}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-white shadow-lg border-l p-4 space-y-4 overflow-y-auto">
            {/* Monkey Character */}
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <div
                  className={`text-6xl mb-2 transition-all duration-500 ${
                    monkeyState === "drawing"
                      ? "animate-bounce"
                      : monkeyState === "colorPicking"
                        ? "animate-pulse"
                        : monkeyState === "erasing"
                          ? "animate-ping"
                          : monkeyState === "celebrating"
                            ? "animate-spin"
                            : monkeyState === "confused"
                              ? "animate-pulse"
                              : monkeyState === "typing"
                                ? "animate-pulse"
                                : ""
                  }`}
                >
                  {monkeyState === "drawing"
                    ? "🎨"
                    : monkeyState === "colorPicking"
                      ? "🎭"
                      : monkeyState === "erasing"
                        ? "😵"
                        : monkeyState === "celebrating"
                          ? "🎉"
                          : monkeyState === "confused"
                            ? "🤔"
                            : monkeyState === "typing"
                              ? "✍️"
                              : ""}
                </div>
                {motivationalText && (
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                    {motivationalText}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Text Controls */}
            {(tool === "text" || showTextControls) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-3 text-gray-800">Text Settings</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Font Family</label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Font Size: {fontSize}px</label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        max={72}
                        min={8}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={fontWeight === "bold" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFontWeight(fontWeight === "bold" ? "normal" : "bold")}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={fontStyle === "italic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFontStyle(fontStyle === "italic" ? "normal" : "italic")}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={textDecoration === "underline" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTextDecoration(textDecoration === "underline" ? "none" : "underline")}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={textAlign === "left" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTextAlign("left")}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={textAlign === "center" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTextAlign("center")}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={textAlign === "right" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTextAlign("right")}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tool Settings */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 text-gray-800">Tool Settings</h3>

                {/* Brush Size */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Size: {brushSize}px</label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(value) => setBrushSize(value[0])}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Opacity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Opacity: {opacity}%</label>
                  <Slider
                    value={[opacity]}
                    onValueChange={(value) => setOpacity(value[0])}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Brush Style */}
                {tool === "brush" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Brush Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["round", "square", "splatter", "textured"] as BrushStyle[]).map((style) => (
                        <Button
                          key={style}
                          variant={brushStyle === style ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBrushStyle(style)}
                          className="capitalize text-xs"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill Mode for Shapes */}
                {["rectangle", "circle", "triangle"].includes(tool) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Fill Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["stroke", "fill", "both"] as FillMode[]).map((mode) => (
                        <Button
                          key={mode}
                          variant={fillMode === mode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFillMode(mode)}
                          className="capitalize text-xs"
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fill Tolerance for Fill Tool */}
                {tool === "fill" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Tolerance: {fillTolerance}</label>
                    <Slider
                      value={[fillTolerance]}
                      onValueChange={(value) => setFillTolerance(value[0])}
                      max={50}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Colors</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowColorPalette(!showColorPalette)}>
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>

                {/* Current Colors */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stroke</label>
                    <div
                      className="w-full h-8 rounded-lg border-2 border-gray-300 cursor-pointer shadow-inner"
                      style={{ backgroundColor: currentColor }}
                      onClick={() => setShowColorPalette(!showColorPalette)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fill</label>
                    <div
                      className="w-full h-8 rounded-lg border-2 border-gray-300 cursor-pointer shadow-inner"
                      style={{ backgroundColor: fillColor }}
                      onClick={() => setShowColorPalette(!showColorPalette)}
                    />
                  </div>
                </div>

                {showColorPalette && (
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform shadow-sm"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (tool === "fill" || fillMode === "fill" || fillMode === "both") {
                            setFillColor(color)
                          } else {
                            setCurrentColor(color)
                          }
                          setMonkeyState("colorPicking")
                          setTimeout(() => setMonkeyState("idle"), 1500)
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 text-gray-800">Actions</h3>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Undo
                  </Button>
                  <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                    <RotateCw className="h-4 w-4 mr-1" />
                    Redo
                  </Button>
                </div>

                {selectedElements.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button variant="outline" size="sm" onClick={copySelected}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="destructive" size="sm" onClick={deleteSelected}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={clearCanvas} className="w-full mb-2 bg-transparent">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>

                <Button size="sm" onClick={resetZoom} className="w-full mb-2 bg-blue-500 hover:bg-blue-600">
                  <Eye className="h-4 w-4 mr-1" />
                  Reset View
                </Button>

                <Button size="sm" onClick={saveImage} className="w-full mb-2 bg-green-500 hover:bg-green-600">
                  <Download className="h-4 w-4 mr-1" />
                  Save Image
                </Button>

                <Button size="sm" onClick={shareOnTwitter} className="w-full bg-blue-400 hover:bg-blue-500">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Layers Panel */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Elements ({elements.length})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {elements
                    .slice(-5)
                    .reverse()
                    .map((element, index) => (
                      <div
                        key={element.id}
                        className={`p-2 rounded border text-xs cursor-pointer ${
                          selectedElements.includes(element.id) ? "bg-orange-100 border-orange-300" : "bg-gray-50"
                        }`}
                        onClick={() => {
                          setElements((prev) => prev.map((el) => ({ ...el, selected: el.id === element.id })))
                          setSelectedElements([element.id])
                          redrawCanvas()
                        }}
                      >
                        {element.type === "text" ? `Text: ${element.text?.slice(0, 20)}...` : `${element.type} element`}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
