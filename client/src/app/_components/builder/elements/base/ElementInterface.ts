export interface Element {
  id: string;
  type: string;
  content: string;
  styles: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    textAlign?: string;
    borderRadius?: string;
    border?: string;
    opacity?: string;
    boxShadow?: string;
    transform?: string;
    transition?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    zIndex?: string;
    overflow?: string;
    display?: string;
    flexDirection?: string;
    justifyContent?: string;
    alignItems?: string;
    gap?: string;
    fontFamily?: string;
    lineHeight?: string;
    letterSpacing?: string;
    verticalAlign?: string;
    backgroundRepeat?: string;
    textDecoration?: string;
    cursor?: string;
    width?: string;
    height?: string;
    position?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  classes?: string[];
  attributes?: Record<string, string>;
  imageUrl?: string;
  videoUrl?: string;
  url?: string;
  buttonType?: 'button' | 'submit' | 'reset';
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  animation?: {
    type: string;
    duration: number;
    delay: number;
    iteration: string;
  };
  interaction?: {
    hover?: {
      styles?: Record<string, string>;
    };
  };
}

export interface ElementConfig {
  type: string;
  name: string;
  category: string;
  defaultContent: string;
  defaultStyles: Record<string, string>;
  defaultSize: { width: number; height: number };
  icon: string;
  description: string;
}

export interface ElementFactory {
  create: (type: string, id?: string) => Element;
  getConfig: (type: string) => ElementConfig | undefined;
  getRenderer: (type: string) => React.ComponentType<ElementRendererProps> | undefined;
  getAllTypes: () => string[];
  getTypesByCategory: (category: string) => string[];
}

export interface ElementRendererProps {
  element: Element;
  isSelected: boolean;
  onSelect: (element: Element, event: React.MouseEvent) => void;
  onUpdate: (id: string, updates: Partial<Element>) => void;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, element: Element) => void;
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  isDragging?: boolean;
}