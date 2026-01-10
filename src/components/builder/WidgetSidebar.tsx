import { WIDGET_CONFIGS } from '@/config/widgets';
import { WidgetIcon } from './WidgetIcon';
import { WidgetType } from '@/types/builder';

interface WidgetSidebarProps {
  onDragStart: (e: React.DragEvent, widgetType: WidgetType) => void;
}

export const WidgetSidebar = ({ onDragStart }: WidgetSidebarProps) => {
  const textWidgets = WIDGET_CONFIGS.filter((w) => w.category === 'text');
  const inputWidgets = WIDGET_CONFIGS.filter((w) => w.category === 'input');
  const layoutWidgets = WIDGET_CONFIGS.filter((w) => w.category === 'layout');

  return (
    <aside className="w-full md:w-72 bg-sidebar border-r border-sidebar-border p-4 md:p-6 overflow-y-auto no-print">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Widgets</h2>
        <p className="text-sm text-muted-foreground">Drag elements to the canvas</p>
      </div>

      {/* Text Elements */}
      <div className="mb-6 animate-fade-in">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Text Elements
        </h3>
        <div className="space-y-2">
          {textWidgets.map((widget) => (
            <div
              key={widget.type}
              draggable
              onDragStart={(e) => onDragStart(e, widget.type)}
              className="sidebar-widget"
            >
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <WidgetIcon iconName={widget.icon} className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{widget.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input Elements */}
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Form Inputs
        </h3>
        <div className="space-y-2">
          {inputWidgets.map((widget) => (
            <div
              key={widget.type}
              draggable
              onDragStart={(e) => onDragStart(e, widget.type)}
              className="sidebar-widget"
            >
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <WidgetIcon iconName={widget.icon} className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{widget.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Elements */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Layout
        </h3>
        <div className="space-y-2">
          {layoutWidgets.map((widget) => (
            <div
              key={widget.type}
              draggable
              onDragStart={(e) => onDragStart(e, widget.type)}
              className="sidebar-widget"
            >
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <WidgetIcon iconName={widget.icon} className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{widget.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
