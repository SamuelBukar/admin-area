import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MdArrowBack, MdSave, MdSend } from 'react-icons/md';
import { usePageDetail } from '@/hooks/useQueries';
import { useSubmitApplication } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FormElement, 
  InputContent, 
  SelectContent as SelectContentType, 
  RadioContent, 
  CheckboxContent, 
  GridContent, 
  ContainerContent, 
  SpaceContent, 
  ImageContent, 
  ButtonContent,
  NameContent,
  AddressContent,
  PhoneContent,
  NumberContent,
  NigeriaStateContent,
  NigeriaCityContent,
  CountryContent,
  PassportImageContent,
} from '@/types/builder';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { NIGERIA_STATES, NIGERIA_CITIES_BY_STATE } from '@/lib/nigeriaLocations';

export default function ApplicationForm() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: page, isLoading } = usePageDetail(pageId || '');
  const submitApplication = useSubmitApplication();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [templateSteps, setTemplateSteps] = useState<FormElement[][] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepsLoading, setIsStepsLoading] = useState(false);

  // Recursively initialize form data for all elements including nested ones
  const initializeFormData = (elements: FormElement[]): Record<string, any> => {
      const initialData: Record<string, any> = {};
    
    const processElement = (element: FormElement) => {
        if (element.type === 'INPUT' || element.type === 'TEXTAREA' || element.type === 'DATE') {
          initialData[element.id] = '';
        } else if (element.type === 'CHECKBOX') {
          initialData[element.id] = false;
        } else if (element.type === 'SELECT' || element.type === 'RADIO') {
          initialData[element.id] = '';
      } else if (element.type === 'NUMBER') {
        initialData[element.id] = '';
      } else if (element.type === 'PHONE') {
        initialData[element.id] = '';
      } else if (element.type === 'ADDRESS') {
        initialData[element.id] = '';
      } else if (element.type === 'NIGERIA_STATE') {
        initialData[element.id] = '';
      } else if (element.type === 'NIGERIA_CITY') {
        initialData[element.id] = '';
      } else if (element.type === 'COUNTRY') {
        initialData[element.id] = 'Nigeria';
      } else if (element.type === 'NAME') {
        initialData[element.id] = {
          firstName: '',
          middleName: '',
          lastName: '',
        };
      } else if (element.type === 'PASSPORT_IMAGE') {
        initialData[element.id] = null;
      } else if (element.type === 'CONTAINER') {
        const containerContent = element.content as ContainerContent;
        if (containerContent.children) {
          containerContent.children.forEach(processElement);
        }
      } else if (element.type === 'GRID') {
        const gridContent = element.content as GridContent;
        if (gridContent.children) {
          gridContent.children.forEach(column => {
            column.forEach(processElement);
          });
        }
      }
    };
    
    elements.forEach(processElement);
    return initialData;
  };

  // Initialize multi-step structure based on linked templates (if any)
  useEffect(() => {
    const loadTemplateSteps = async () => {
      if (!page || !page.templateIds || page.templateIds.length === 0) {
        setTemplateSteps(null);
        setIsStepsLoading(false);
        return;
      }

      try {
        setIsStepsLoading(true);
        // Lazy-load templates directly from pagesApi to preserve their individual structures
        const { pagesApi } = await import('@/lib/api');
        const templates = [];
        for (const id of page.templateIds) {
          const tpl = await pagesApi.getById(id);
          if (tpl && tpl.elements && tpl.elements.length > 0) {
            templates.push(tpl);
          }
        }
        const steps = templates.map((tpl) => tpl.elements || []);
        setTemplateSteps(steps.length > 0 ? steps : null);
        setCurrentStep(0);
      } catch (e) {
        console.error('Failed to load template steps for form:', e);
        setTemplateSteps(null);
      } finally {
        setIsStepsLoading(false);
      }
    };

    loadTemplateSteps();
  }, [page]);

  // Initialize form data whenever the underlying elements change (single or multi-step)
  useEffect(() => {
    const allElements: FormElement[] | undefined = templateSteps
      ? templateSteps.flat()
      : page?.elements;
    if (allElements && allElements.length > 0) {
      const initialData = initializeFormData(allElements);
      setFormData(initialData);
      setErrors({});
      setCurrentStep(0);
    }
  }, [page, templateSteps]);


  const validateForm = (elementsToValidate?: FormElement[]): boolean => {
    const newErrors: Record<string, string> = {};
    
    const elementsSource: FormElement[] | undefined =
      elementsToValidate ||
      (templateSteps ? templateSteps.flat() : page?.elements);

    if (!elementsSource || elementsSource.length === 0) return false;

    // Use a helper function to validate recursively
    const validateRecursive = (elements: FormElement[]) => {
      elements.forEach(element => {
      if (element.type === 'INPUT' || element.type === 'TEXTAREA' || element.type === 'DATE') {
        const content = element.content as InputContent;
        if (content.required && !formData[element.id]) {
          newErrors[element.id] = `${content.label} is required`;
        }
        } else if (element.type === 'SELECT') {
          const content = element.content as SelectContentType;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'RADIO') {
          const content = element.content as RadioContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'NUMBER') {
          const content = element.content as NumberContent;
          if (content.required && (formData[element.id] === '' || formData[element.id] === null || formData[element.id] === undefined)) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'PHONE') {
          const content = element.content as PhoneContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'ADDRESS') {
          const content = element.content as AddressContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'NIGERIA_STATE') {
          const content = element.content as NigeriaStateContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'NIGERIA_CITY') {
          const content = element.content as NigeriaCityContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'COUNTRY') {
          const content = element.content as CountryContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'NAME') {
          const content = element.content as NameContent;
          const value = formData[element.id] || {};
          if (content.firstRequired && !value.firstName) {
            newErrors[`${element.id}-firstName`] = `${content.firstNameLabel} is required`;
          }
          if (content.lastRequired && !value.lastName) {
            newErrors[`${element.id}-lastName`] = `${content.lastNameLabel} is required`;
          }
        } else if (element.type === 'PASSPORT_IMAGE') {
          const content = element.content as PassportImageContent;
          if (content.required && !formData[element.id]) {
            newErrors[element.id] = `${content.label} is required`;
          }
        } else if (element.type === 'CONTAINER') {
          const containerContent = element.content as ContainerContent;
          if (containerContent.children) {
            validateRecursive(containerContent.children);
          }
        } else if (element.type === 'GRID') {
          const gridContent = element.content as GridContent;
          if (gridContent.children) {
            gridContent.children.forEach(column => {
              validateRecursive(column);
            });
          }
        }
      });
    };

    validateRecursive(elementsSource);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'submitted' = 'submitted') => {
    if (status === 'submitted' && !validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!pageId || !user?.id) {
      toast.error('Missing required information');
      return;
    }

    try {
      await submitApplication.mutateAsync({
        pageId,
        userId: user.id,
        formData,
        status,
      });
      // Show success message and allow user to submit again or view applications
      if (status === 'submitted') {
        toast.success('Application submitted successfully! You can submit another application if needed.');
      } else {
        toast.success('Application saved as draft');
      }
      // Reset form data for new application
      const allElements: FormElement[] | undefined = templateSteps
        ? templateSteps.flat()
        : page?.elements;
      if (allElements && allElements.length > 0) {
        const initialData = initializeFormData(allElements);
        setFormData(initialData);
        setErrors({});
        setCurrentStep(0);
      }
      // Navigate to my applications after a short delay
      setTimeout(() => {
      navigate('/dashboard/my-applications');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleNextStep = () => {
    if (!templateSteps || templateSteps.length === 0) return;
    const currentElements = templateSteps[currentStep] || [];
    const isValid = validateForm(currentElements);
    if (!isValid) {
      toast.error('Please fill in all required fields in this section before continuing');
      return;
    }
    if (currentStep < templateSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    if (!templateSteps || templateSteps.length === 0) return;
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderElement = (element: FormElement): React.ReactNode => {
    const elementStyle = element.styles || {};

    switch (element.type) {
      case 'TITLE':
        return (
          <h1 className="text-3xl font-bold text-foreground mb-4" style={elementStyle}>
            {(element.content as string) || 'Title'}
          </h1>
        );

      case 'SUBTITLE':
        return (
          <h2 className="text-2xl font-semibold text-foreground mb-3" style={elementStyle}>
            {(element.content as string) || 'Subtitle'}
          </h2>
        );

      case 'PARAGRAPH':
        return (
          <p className="text-foreground mb-4" style={elementStyle}>
            {(element.content as string) || 'Paragraph text'}
          </p>
        );

      case 'DIVIDER':
        return <hr className="my-4" style={elementStyle} />;

      case 'INPUT':
      case 'DATE': {
        const inputContent = element.content as InputContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {inputContent.label}
              {inputContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              type={element.type === 'DATE' ? 'date' : 'text'}
              placeholder={inputContent.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'TEXTAREA': {
        const textareaContent = element.content as InputContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {textareaContent.label}
              {textareaContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              placeholder={textareaContent.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
              rows={4}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'SELECT': {
        const selectContent = element.content as SelectContentType;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {selectContent.label}
              {selectContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value || undefined}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
            >
              <SelectTrigger className={errors[element.id] ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {selectContent.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'RADIO': {
        const radioContent = element.content as RadioContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {radioContent.label}
              {radioContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
            >
              {radioContent.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${element.id}-${index}`} />
                  <Label htmlFor={`${element.id}-${index}`} className="font-normal cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'CHECKBOX': {
        const checkboxContent = element.content as CheckboxContent;
        const value = formData[element.id] || false;
        return (
          <div className="flex items-center space-x-3 mb-4" style={elementStyle}>
            <Checkbox
              id={element.id}
              checked={value}
              onCheckedChange={(checked) => setFormData({ ...formData, [element.id]: checked })}
            />
            <Label htmlFor={element.id} className="text-sm text-foreground cursor-pointer">
              {checkboxContent.label}
            </Label>
          </div>
        );
      }

      case 'NUMBER': {
        const numberContent = element.content as NumberContent;
        const raw = formData[element.id];
        const value = raw === undefined || raw === null ? '' : raw;
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {numberContent.label}
              {numberContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              type="number"
              placeholder={numberContent.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'PHONE': {
        const phoneContent = element.content as PhoneContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {phoneContent.label}
              {phoneContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              type="tel"
              placeholder={phoneContent.placeholder || '+234XXXXXXXXXX'}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'ADDRESS': {
        const addressContent = element.content as AddressContent;
        const value = formData[element.id] || '';
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {addressContent.label}
              {addressContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              placeholder={addressContent.placeholder}
              value={value}
              onChange={(e) => setFormData({ ...formData, [element.id]: e.target.value })}
              className={errors[element.id] ? 'border-destructive' : ''}
              rows={3}
            />
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'NIGERIA_STATE': {
        const stateContent = element.content as NigeriaStateContent;
        const value = formData[element.id] || '';
        
        // Find all city fields that depend on this state and reset them when state changes
        const handleStateChange = (newState: string) => {
          const allElements: FormElement[] = templateSteps
            ? templateSteps.flat()
            : page?.elements || [];
          const updatedFormData = { ...formData, [element.id]: newState };
          
          // Reset all city fields when state changes
          allElements.forEach((el) => {
            if (el.type === 'NIGERIA_CITY') {
              updatedFormData[el.id] = '';
            }
          });
          
          setFormData(updatedFormData);
        };
        
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {stateContent.label}
              {stateContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value || undefined}
              onValueChange={handleStateChange}
            >
              <SelectTrigger className={errors[element.id] ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {NIGERIA_STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'NIGERIA_CITY': {
        const cityContent = element.content as NigeriaCityContent;
        const value = formData[element.id] || '';

        // Try to find a related state field in the same form
        const allElements: FormElement[] = templateSteps
          ? templateSteps.flat()
          : page?.elements || [];
        const stateElement = allElements.find((el) => el.type === 'NIGERIA_STATE');
        const selectedState = stateElement ? formData[stateElement.id] : '';
        const cities =
          selectedState && NIGERIA_CITIES_BY_STATE[selectedState]
            ? NIGERIA_CITIES_BY_STATE[selectedState]
            : [];

        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {cityContent.label}
              {cityContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value || undefined}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
              disabled={!selectedState}
            >
              <SelectTrigger className={errors[element.id] ? 'border-destructive' : ''}>
                <SelectValue placeholder={selectedState ? 'Select a city / LGA' : 'Select a state first'} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'COUNTRY': {
        const countryContent = element.content as CountryContent;
        const value = formData[element.id] || 'Nigeria';
        const options =
          countryContent.options && countryContent.options.length > 0
            ? countryContent.options
            : ['Nigeria'];
        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {countryContent.label}
              {countryContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => setFormData({ ...formData, [element.id]: val })}
            >
              <SelectTrigger className={errors[element.id] ? 'border-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'NAME': {
        const nameContent = element.content as NameContent;
        const value = formData[element.id] || { firstName: '', middleName: '', lastName: '' };
        const firstErrorKey = `${element.id}-firstName`;
        const lastErrorKey = `${element.id}-lastName`;
        return (
          <div className="space-y-3 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {nameContent.label}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {nameContent.firstNameLabel}
                  {nameContent.firstRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  placeholder={nameContent.firstNameLabel}
                  value={value.firstName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [element.id]: { ...value, firstName: e.target.value },
                    })
                  }
                  className={errors[firstErrorKey] ? 'border-destructive' : ''}
                />
                {errors[firstErrorKey] && (
                  <p className="text-xs text-destructive">{errors[firstErrorKey]}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {nameContent.middleNameLabel}
                </Label>
                <Input
                  placeholder={nameContent.middleNameLabel}
                  value={value.middleName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [element.id]: { ...value, middleName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {nameContent.lastNameLabel}
                  {nameContent.lastRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  placeholder={nameContent.lastNameLabel}
                  value={value.lastName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [element.id]: { ...value, lastName: e.target.value },
                    })
                  }
                  className={errors[lastErrorKey] ? 'border-destructive' : ''}
                />
                {errors[lastErrorKey] && (
                  <p className="text-xs text-destructive">{errors[lastErrorKey]}</p>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'PASSPORT_IMAGE': {
        const passportContent = element.content as PassportImageContent;
        const value = formData[element.id];

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
          }

          const maxSize = 2 * 1024 * 1024; // 2MB
          if (file.size > maxSize) {
            toast.error('Passport image must be less than 2MB');
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            setFormData({ ...formData, [element.id]: dataUrl });
          };
          reader.readAsDataURL(file);
        };

        return (
          <div className="space-y-2 mb-4" style={elementStyle}>
            <Label className="text-sm font-medium text-foreground">
              {passportContent.label}
              {passportContent.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            <p className="text-xs text-muted-foreground">
              Upload a clear passport-style photograph (JPEG/PNG, max 2MB).
            </p>
            </div>
            {value && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                <img
                  src={value}
                  alt="Passport preview"
                  className="h-32 w-32 object-cover rounded-md border"
                />
              </div>
            )}
            {errors[element.id] && (
              <p className="text-sm text-destructive">{errors[element.id]}</p>
            )}
          </div>
        );
      }

      case 'CONTAINER': {
        const containerContent = element.content as ContainerContent;
        const elementStyle = element.styles || {};
        return (
          <div 
            className="border-2 border-dashed rounded-lg p-4 mb-4 bg-muted/20" 
            style={elementStyle}
          >
            {containerContent.title && (
              <h3 className="text-lg font-semibold mb-3">{containerContent.title}</h3>
            )}
            <div className="space-y-4">
              {containerContent.children?.map((child) => (
                <div key={child.id}>
                  {renderElement(child)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'GRID': {
        const gridContent = element.content as GridContent;
        const elementStyle = element.styles || {};
        const gridColumns = gridContent.columns || 2;
        return (
          <div 
            className={`grid gap-4 mb-4`}
            style={{
              ...elementStyle,
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }}
          >
            {gridContent.children?.map((column, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {column.map((child) => (
                  <div key={child.id}>
                    {renderElement(child)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }

      case 'SPACE': {
        const spaceContent = element.content as SpaceContent;
        return (
          <div style={{ height: `${spaceContent.height || 40}px` }} />
        );
      }

      case 'IMAGE': {
        const imageContent = element.content as ImageContent;
        if (!imageContent.url) return null;
        return (
          <div className="mb-4" style={{ textAlign: imageContent.alignment || 'center', ...elementStyle }}>
            <img
              src={imageContent.url}
              alt={imageContent.alt || 'Form image'}
              style={{
                width: imageContent.width || '100%',
                height: imageContent.height || 'auto',
                maxWidth: '100%',
              }}
              className="rounded-lg"
            />
          </div>
        );
      }

      case 'BUTTON': {
        const buttonContent = element.content as ButtonContent;
        const handleButtonClick = async (e: React.MouseEvent) => {
          e.preventDefault();
          if (buttonContent.actionType === 'link' && buttonContent.link) {
            if (buttonContent.openInNewTab) {
              window.open(buttonContent.link, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = buttonContent.link;
            }
          } else if (buttonContent.actionType === 'api' && buttonContent.apiEndpoint) {
            toast.info('API action triggered', {
              description: `Calling ${buttonContent.apiMethod || 'GET'} ${buttonContent.apiEndpoint}`,
            });
            // In a real app, you would make the API call here
          }
        };
        return (
          <div className="mb-4" style={elementStyle}>
            <Button
              type="button"
              onClick={handleButtonClick}
              variant="default"
            >
              {buttonContent.label}
            </Button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Page not found</p>
            <Button onClick={() => navigate('/dashboard/applications')} className="mt-4">
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | Application Form</title>
        <meta name="description" content={`Submit application: ${page.title}`} />
      </Helmet>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/applications')}
              className="mb-4"
            >
              <MdArrowBack className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{page.title}</h1>
            <p className="text-muted-foreground mt-2">
              {page.publishedAt && `Published on ${format(new Date(page.publishedAt), 'MMM dd, yyyy')}`}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              handleSubmit('submitted');
            }}>
              {isStepsLoading && (
                <div className="space-y-4 mb-4">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              {!isStepsLoading && (
                <>
                  {templateSteps && templateSteps.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">
                        Step {currentStep + 1} of {templateSteps.length}
                      </Badge>
                    </div>
                  )}

                  {(() => {
                    const elementsToRender: FormElement[] =
                      templateSteps && templateSteps.length > 0
                        ? templateSteps[currentStep] || []
                        : page.elements || [];

                    return elementsToRender.map((element) => (
                <div key={element.id}>
                  {renderElement(element)}
                </div>
                    ));
                  })()}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t">
                <div className="flex gap-3">
                  {templateSteps && templateSteps.length > 0 && currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={submitApplication.isPending}
                    >
                      <MdArrowBack className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit('draft')}
                  disabled={submitApplication.isPending}
                >
                  <MdSave className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                  {templateSteps && templateSteps.length > 0 && currentStep < (templateSteps.length - 1) ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={submitApplication.isPending}
                    >
                      Next
                    </Button>
                  ) : (
                <Button
                  type="button"
                  onClick={() => handleSubmit('submitted')}
                  disabled={submitApplication.isPending}
                >
                  <MdSend className="w-4 h-4 mr-2" />
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

