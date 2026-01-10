import { 
  MdTitle, 
  MdSubtitles, 
  MdNotes, 
  MdHorizontalRule,
  MdInput,
  MdTextFields,
  MdCheckBox,
  MdRadioButtonChecked,
  MdArrowDropDownCircle,
  MdCalendarToday,
  MdViewColumn,
  MdViewAgenda,
  MdHeight,
  MdImage,
  MdSmartButton
} from 'react-icons/md';

interface WidgetIconProps {
  iconName: string;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdTitle,
  MdSubtitles,
  MdNotes,
  MdHorizontalRule,
  MdInput,
  MdTextFields,
  MdCheckBox,
  MdRadioButtonChecked,
  MdArrowDropDownCircle,
  MdCalendarToday,
  MdViewColumn,
  MdViewAgenda,
  MdHeight,
  MdImage,
  MdSmartButton,
};

export const WidgetIcon = ({ iconName, className = '' }: WidgetIconProps) => {
  const Icon = iconMap[iconName];
  
  if (!Icon) {
    return <MdInput className={className} />;
  }

  return <Icon className={className} />;
};
