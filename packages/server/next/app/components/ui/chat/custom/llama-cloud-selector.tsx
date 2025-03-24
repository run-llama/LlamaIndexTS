import { useChatUI } from "@llamaindex/chat-ui";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../select";
import { useClientConfig } from "../hooks/use-config";

type LLamaCloudPipeline = {
  id: string;
  name: string;
};

type LLamaCloudProject = {
  id: string;
  organization_id: string;
  name: string;
  is_default: boolean;
  pipelines: Array<LLamaCloudPipeline>;
};

type PipelineConfig = {
  project: string; // project name
  pipeline: string; // pipeline name
};

type LlamaCloudConfig = {
  projects?: LLamaCloudProject[];
  pipeline?: PipelineConfig;
};

export interface LlamaCloudSelectorProps {
  onSelect?: (pipeline: PipelineConfig | undefined) => void;
  defaultPipeline?: PipelineConfig;
  shouldCheckValid?: boolean;
}

export function LlamaCloudSelector({
  onSelect,
  defaultPipeline,
  shouldCheckValid = false,
}: LlamaCloudSelectorProps) {
  const { backend } = useClientConfig();
  const { setRequestData } = useChatUI();
  const [config, setConfig] = useState<LlamaCloudConfig>();

  const updateRequestParams = useCallback(
    (pipeline?: PipelineConfig) => {
      if (setRequestData) {
        setRequestData({
          llamaCloudPipeline: pipeline,
        });
      } else {
        onSelect?.(pipeline);
      }
    },
    [onSelect, setRequestData],
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_LLAMACLOUD === "true" && !config) {
      fetch(`${backend}/api/chat/config/llamacloud`)
        .then((response) => {
          if (!response.ok) {
            return response.json().then((errorData) => {
              window.alert(
                `Error: ${JSON.stringify(errorData) || "Unknown error occurred"}`,
              );
            });
          }
          return response.json();
        })
        .then((data) => {
          const pipeline = defaultPipeline ?? data.pipeline; // defaultPipeline will override pipeline in .env
          setConfig({ ...data, pipeline });
          updateRequestParams(pipeline);
        })
        .catch((error) => console.error("Error fetching config", error));
    }
  }, [backend, config, defaultPipeline, updateRequestParams]);

  const setPipeline = (pipelineConfig?: PipelineConfig) => {
    setConfig((prevConfig: any) => ({
      ...prevConfig,
      pipeline: pipelineConfig,
    }));
    updateRequestParams(pipelineConfig);
  };

  const handlePipelineSelect = async (value: string) => {
    setPipeline(JSON.parse(value) as PipelineConfig);
  };

  if (process.env.NEXT_PUBLIC_USE_LLAMACLOUD !== "true") {
    return null;
  }

  if (!config) {
    return (
      <div className="flex justify-center items-center p-3">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (shouldCheckValid && !isValid(config.projects, config.pipeline)) {
    return (
      <p className="text-red-500">
        Invalid LlamaCloud configuration. Check console logs.
      </p>
    );
  }
  const { projects, pipeline } = config;

  return (
    <Select
      onValueChange={handlePipelineSelect}
      defaultValue={
        isValid(projects, pipeline, false)
          ? JSON.stringify(pipeline)
          : undefined
      }
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a pipeline" />
      </SelectTrigger>
      <SelectContent>
        {projects!.map((project: LLamaCloudProject) => (
          <SelectGroup key={project.id}>
            <SelectLabel className="capitalize">
              Project: {project.name}
            </SelectLabel>
            {project.pipelines.map((pipeline) => (
              <SelectItem
                key={pipeline.id}
                className="last:border-b"
                value={JSON.stringify({
                  pipeline: pipeline.name,
                  project: project.name,
                })}
              >
                <span className="pl-2">{pipeline.name}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function isValid(
  projects: LLamaCloudProject[] | undefined,
  pipeline: PipelineConfig | undefined,
  logErrors: boolean = true,
): boolean {
  if (!projects?.length) return false;
  if (!pipeline) return false;
  const matchedProject = projects.find(
    (project: LLamaCloudProject) => project.name === pipeline.project,
  );
  if (!matchedProject) {
    if (logErrors) {
      console.error(
        `LlamaCloud project ${pipeline.project} not found. Check LLAMA_CLOUD_PROJECT_NAME variable`,
      );
    }
    return false;
  }
  const pipelineExists = matchedProject.pipelines.some(
    (p) => p.name === pipeline.pipeline,
  );
  if (!pipelineExists) {
    if (logErrors) {
      console.error(
        `LlamaCloud pipeline ${pipeline.pipeline} not found. Check LLAMA_CLOUD_INDEX_NAME variable`,
      );
    }
    return false;
  }
  return true;
}
