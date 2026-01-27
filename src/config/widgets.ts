import { WidgetConfig } from '@/types/builder';

export const WIDGET_CONFIGS: WidgetConfig[] = [
  // Text Elements
  {
    type: 'TITLE',
    label: 'Title',
    icon: 'MdTitle',
    defaultContent: 'Document Title',
    category: 'text',
  },
  {
    type: 'SUBTITLE',
    label: 'Subtitle',
    icon: 'MdSubtitles',
    defaultContent: 'Section Subtitle',
    category: 'text',
  },
  {
    type: 'PARAGRAPH',
    label: 'Paragraph',
    icon: 'MdNotes',
    defaultContent: 'Enter your paragraph text here...',
    category: 'text',
  },
  {
    type: 'DIVIDER',
    label: 'Divider',
    icon: 'MdHorizontalRule',
    defaultContent: '',
    category: 'text',
  },

  // Input Elements
  {
    type: 'INPUT',
    label: 'Text Input',
    icon: 'MdInput',
    defaultContent: {
      label: 'Field Label',
      placeholder: 'Enter text...',
      required: false,
    },
    category: 'input',
  },
  {
    type: 'TEXTAREA',
    label: 'Text Area',
    icon: 'MdTextFields',
    defaultContent: {
      label: 'Description',
      placeholder: 'Enter detailed text...',
      required: false,
    },
    category: 'input',
  },
  {
    type: 'CHECKBOX',
    label: 'Checkbox',
    icon: 'MdCheckBox',
    defaultContent: {
      label: 'I agree to the terms',
      checked: false,
    },
    category: 'input',
  },
  {
    type: 'RADIO',
    label: 'Radio Group',
    icon: 'MdRadioButtonChecked',
    defaultContent: {
      label: 'Select an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false,
    },
    category: 'input',
  },
  {
    type: 'SELECT',
    label: 'Dropdown',
    icon: 'MdArrowDropDownCircle',
    defaultContent: {
      label: 'Choose an option',
      options: ['Option 1', 'Option 2', 'Option 3'],
      required: false,
    },
    category: 'input',
  },
  {
    type: 'DATE',
    label: 'Date Picker',
    icon: 'MdCalendarToday',
    defaultContent: {
      label: 'Select Date',
      placeholder: 'mm/dd/yyyy',
      required: false,
    },
    category: 'input',
  },

  // Layout Elements
  {
    type: 'GRID',
    label: '2-Column Grid',
    icon: 'MdViewColumn',
    defaultContent: {
      columns: 2,
      children: [[], []],
    },
    category: 'layout',
  },
  {
    type: 'CONTAINER',
    label: 'Container',
    icon: 'MdViewAgenda',
    defaultContent: {
      title: 'Container',
      children: [],
    },
    category: 'layout',
  },
  {
    type: 'SPACE',
    label: 'Spacer',
    icon: 'MdHeight',
    defaultContent: {
      height: 40,
    },
    category: 'layout',
  },
  {
    type: 'IMAGE',
    label: 'Image',
    icon: 'MdImage',
    defaultContent: {
      url: 'https://via.placeholder.com/400x300?text=Image',
      alt: 'Image description',
      width: '100%',
      height: 'auto',
      alignment: 'center',
    },
    category: 'text',
  },
  {
    type: 'BUTTON',
    label: 'Button',
    icon: 'MdSmartButton',
    defaultContent: {
      label: 'Click Me',
      actionType: 'link',
      link: 'https://example.com',
      openInNewTab: false,
    },
    category: 'input',
  },

  // Advanced Input Bundles
  {
    type: 'NAME',
    label: 'Full Name (NG)',
    icon: 'MdPerson',
    defaultContent: {
      label: 'Full Name',
      firstNameLabel: 'First Name',
      middleNameLabel: 'Middle Name (Optional)',
      lastNameLabel: 'Last Name',
      firstRequired: true,
      lastRequired: true,
    },
    category: 'input',
  },
  {
    type: 'ADDRESS',
    label: 'Address',
    icon: 'MdLocationOn',
    defaultContent: {
      label: 'Residential Address',
      placeholder: 'House No, Street, Area...',
      required: true,
    },
    category: 'input',
  },
  {
    type: 'NIGERIA_STATE',
    label: 'State (Nigeria)',
    icon: 'MdMap',
    defaultContent: {
      label: 'State of Residence',
      required: true,
    },
    category: 'input',
  },
  {
    type: 'NIGERIA_CITY',
    label: 'City / LGA (Nigeria)',
    icon: 'MdLocationCity',
    defaultContent: {
      label: 'City / LGA',
      required: true,
    },
    category: 'input',
  },
  {
    type: 'COUNTRY',
    label: 'Country (NG Focus)',
    icon: 'MdPublic',
    defaultContent: {
      label: 'Country',
      required: true,
      options: ['Nigeria'],
    },
    category: 'input',
  },
  {
    type: 'PHONE',
    label: 'Phone Number (NG)',
    icon: 'MdPhone',
    defaultContent: {
      label: 'Phone Number',
      placeholder: '+234XXXXXXXXXX',
      required: true,
    },
    category: 'input',
  },
  {
    type: 'NUMBER',
    label: 'Number',
    icon: 'MdPin',
    defaultContent: {
      label: 'Numeric Field',
      placeholder: 'Enter number...',
      required: false,
    },
    category: 'input',
  },
  {
    type: 'PASSPORT_IMAGE',
    label: 'Passport Photograph',
    icon: 'MdAccountBox',
    defaultContent: {
      label: 'Passport Photograph',
      required: true,
    },
    category: 'input',
  },
];

export const getWidgetConfig = (type: string): WidgetConfig | undefined => {
  return WIDGET_CONFIGS.find((config) => config.type === type);
};
