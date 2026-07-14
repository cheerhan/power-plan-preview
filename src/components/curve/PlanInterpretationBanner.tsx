import { useState } from 'react';
import { Info, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ProjectType, PROJECT_TYPE_LABELS } from '@/types/curve';

interface Props {
  projectType: ProjectType;
  projectName: string;
}

const DEFAULT_TEXT: Record<ProjectType, string> = {
  A: '本计划以储能充放电限值曲线为核心，依据电价 / 负荷波动优化每日充放电时段，指导现场控制器执行，实现削峰填谷与套利收益。',
  B: '本计划结合光伏预测出力，安排储能充放电时段：日间富余光伏优先充电，负荷高峰期放电，减少弃光并降低外购电成本。',
  C: '本计划以「源-储-荷」协同为目标：结合光伏预测、可调负荷排班与储能充放电，优化次日整体运行策略，降低综合用能成本并保障井场生产安全。',
};

const PlanInterpretationBanner = ({ projectType, projectName }: Props) => {
  const [text, setText] = useState(DEFAULT_TEXT[projectType]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  if (editing) {
    return (
      <div className="rounded-md border border-primary/40 bg-primary/5 p-3">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="text-xs font-medium text-foreground">
              计划解读 · {PROJECT_TYPE_LABELS[projectType]}项目
            </div>
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={3}
              className="text-xs"
              placeholder="用一句话说明本计划曲线的目标和作用..."
            />
            <div className="flex justify-end gap-1">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setDraft(text); setEditing(false); }}>
                <X className="h-3.5 w-3.5 mr-1" />取消
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={() => { setText(draft); setEditing(false); }}>
                <Check className="h-3.5 w-3.5 mr-1" />保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-md border border-panel-border bg-accent/30 p-3">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground">计划解读</span>
            <span className="text-[10px] text-muted-foreground">{PROJECT_TYPE_LABELS[projectType]} · {projectName}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">{text}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => { setDraft(text); setEditing(true); }}
          title="编辑解读"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default PlanInterpretationBanner;
