/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, useImperativeHandle } from 'react';
import { CheckCircle, XCircle, Loader2, EyeOff, Eye } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { VLMProviderV2 } from '@main/store/types';
import { useSetting } from '@renderer/hooks/useSetting';
import { Button } from '@renderer/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@renderer/components/ui/form';

import { Input } from '@renderer/components/ui/input';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { cn } from '@renderer/utils';


import { api } from '@/renderer/src/api';

const formSchema = z.object({
  vlmProvider: z.nativeEnum(VLMProviderV2, {
    message: 'Please select a VLM Provider to enhance resolution',
  }),
  vlmBaseUrl: z.string().url(),
  vlmApiKey: z.string().min(1),
  vlmModelName: z.string().min(1),
  useResponsesApi: z.boolean().default(false),
});

export interface VLMSettingsRef {
  submit: () => Promise<z.infer<typeof formSchema>>;
}

interface VLMSettingsProps {
  ref?: React.RefObject<VLMSettingsRef | null>;
  autoSave?: boolean;
  className?: string;
}

export function VLMSettings({
  ref,
  autoSave = false,
  className,
}: VLMSettingsProps) {
  const { settings, updateSetting } = useSetting();
  const [showPassword, setShowPassword] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vlmProvider: undefined,
      vlmBaseUrl: '',
      vlmApiKey: '',
      vlmModelName: '',
      useResponsesApi: false,
    },
  });
  useEffect(() => {
    if (Object.keys(settings).length) {
      form.reset({
        vlmProvider: settings.vlmProvider,
        vlmBaseUrl: settings.vlmBaseUrl,
        vlmApiKey: settings.vlmApiKey,
        vlmModelName: settings.vlmModelName,
        useResponsesApi: settings.useResponsesApi,
      });
    }
  }, [settings, form]);

  const [newProvider, newBaseUrl, newApiKey, newModelName, newUseResponsesApi] =
    form.watch([
      'vlmProvider',
      'vlmBaseUrl',
      'vlmApiKey',
      'vlmModelName',
      'useResponsesApi',
    ]);

  useEffect(() => {
    if (!autoSave) {
      return;
    }
    if (
      newProvider === undefined &&
      newBaseUrl === '' &&
      newApiKey === '' &&
      newModelName === ''
    ) {
      return;
    }

    const validAndSave = async () => {
      const isResponsesApiValid = await form.trigger('useResponsesApi');
      if (
        isResponsesApiValid &&
        newUseResponsesApi !== settings.useResponsesApi
      ) {
        updateSetting({
          ...settings,
          vlmProvider: VLMProviderV2.OpenRouter,
          vlmBaseUrl: 'https://openrouter.ai/api/v1',
          vlmModelName: 'bytedance/ui-tars-1.5-7b',
          useResponsesApi: newUseResponsesApi,
        });
      }
    };

    validAndSave();
  }, [
    autoSave,
    newProvider,
    newBaseUrl,
    newApiKey,
    newModelName,
    newUseResponsesApi,
    settings,
    updateSetting,
    form,
  ]);




  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const forcedValues = {
      ...values,
      vlmProvider: VLMProviderV2.OpenRouter,
      vlmBaseUrl: 'https://openrouter.ai/api/v1',
      vlmModelName: 'bytedance/ui-tars-1.5-7b'
    };
    console.log('onSubmit', forcedValues);

    updateSetting({ ...settings, ...forcedValues });
    toast.success('Settings saved successfully');
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      return new Promise<z.infer<typeof formSchema>>((resolve, reject) => {
        form.handleSubmit(
          (values) => {
            onSubmit(values);
            resolve(values);
          },
          (errors) => {
            reject(errors);
          },
        )();
      });
    },
  }));



  return (
    <>
      <Form {...form}>
        <form className={cn('space-y-8 px-[1px]', className)}>


          {/* OpenRouter API Key Only */}
          <FormField
            control={form.control}
            name="vlmApiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OpenRouter API Key</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      className="bg-transparent border-white/20 text-white placeholder:text-gray-400"
                      placeholder="sk-or-v1-..."
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4 text-gray-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

        </form>
      </Form>


    </>
  );
}

interface ModelAvailabilityCheckProps {
  modelConfig: {
    baseUrl: string;
    apiKey: string;
    modelName: string;
  };
  disabled?: boolean;
  className?: string;
  onResponseApiSupportChange?: (supported: boolean) => void;
}

type CheckStatus = 'idle' | 'checking' | 'success' | 'error';

interface CheckState {
  status: CheckStatus;
  message?: string;
  responseApiSupported?: boolean;
}

export function ModelAvailabilityCheck({
  modelConfig,
  disabled = false,
  className,
  onResponseApiSupportChange,
}: ModelAvailabilityCheckProps) {
  const [checkState, setCheckState] = useState<CheckState>({ status: 'idle' });

  const { baseUrl, apiKey, modelName } = modelConfig;
  const isConfigValid = baseUrl && apiKey && modelName;

  useEffect(() => {
    if (checkState.status === 'success' || checkState.status === 'error') {
      setTimeout(() => {
        // Find the nearest scrollable container
        const scrollContainer = document.querySelector(
          '[data-radix-scroll-area-viewport]',
        );
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 200);
    }
  }, [checkState.status]);

  const handleCheckModel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConfigValid) {
      toast.error(
        'Please fill in all required fields before checking model availability',
      );
      return;
    }

    setCheckState({ status: 'checking' });

    try {
      const [isAvailable, responseApiSupported] = await Promise.all([
        api.checkModelAvailability(modelConfig),
        api.checkVLMResponseApiSupport(modelConfig),
      ]);

      onResponseApiSupportChange?.(responseApiSupported);

      if (isAvailable) {
        const successMessage = `Model "${modelName}" is available and working correctly${responseApiSupported
          ? '. Response API is supported.'
          : '. But Response API is not supported.'
          }`;
        setCheckState({
          status: 'success',
          message: successMessage,
          responseApiSupported,
        });
        console.log('[VLM Model Check] Success:', modelConfig, {
          responseApiSupported,
        });
      } else {
        const errorMessage = `Model "${modelName}" is not responding correctly`;
        setCheckState({
          status: 'error',
          message: errorMessage,
          responseApiSupported,
        });
        console.error('[VLM Model Check] Model not responding:', modelConfig);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      const fullErrorMessage = `Failed to connect to model: ${errorMessage}`;

      setCheckState({
        status: 'error',
        message: fullErrorMessage,
      });

      onResponseApiSupportChange?.(false);

      console.error('[VLM Model Check] Error:', error, {
        baseUrl,
        modelName,
      });
    }
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <Button
        type="button"
        variant="outline"
        onClick={handleCheckModel}
        disabled={
          disabled || checkState.status === 'checking' || !isConfigValid
        }
        className="w-50"
      >
        {checkState.status === 'checking' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking Model...
          </>
        ) : (
          'Check Model Availability'
        )}
      </Button>

      {checkState.status === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 !text-green-600" />
          <AlertDescription className="text-green-800">
            {checkState.message}
          </AlertDescription>
        </Alert>
      )}

      {checkState.status === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 !text-red-600" />
          <AlertDescription className="text-red-800">
            {checkState.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
