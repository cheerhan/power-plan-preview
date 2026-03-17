import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Plus, Filter } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { CurveStatus, PredictionStatus, ProjectType, PREDICTION_STATUS_LABELS } from '@/types/curve';
import { format } from 'date-fns';
import { StrategySummaryCards, CurveTypeKey, StrategyStats } from '@/components/list/StrategySummaryCards';

interface CurveRecord {
  id: string;
  projectName: string;
  projectType: ProjectType;
  curveDate: string;
  storageStatus: CurveStatus | null;
  pvPredictionStatus: PredictionStatus | null;
  adjustableLoadStatus: CurveStatus | null;
  nonAdjLoadPredictionStatus: PredictionStatus | null;
  lastSentOrGeneratedAt: string | null;
  operator: string | null;
}

interface ProjectInfo {
  name: string;
  type: ProjectType;
  hasStorage: boolean;
  hasPv: boolean;
  hasAdjustableLoad: boolean;
  hasNonAdjustableLoad: boolean;
}

const DISPATCH_STATUS_BADGE: Record<CurveStatus, { label: string; className: string }> = {
  sent: { label: '成功', className: 'bg-status-success text-primary-foreground' },
  pending: { label: '待下发', className: 'bg-status-pending text-primary-foreground' },
  failed: { label: '失败', className: 'bg-destructive text-destructive-foreground' },
};

const PREDICTION_STATUS_BADGE: Record<PredictionStatus, { label: string; className: string }> = {
  generated: { label: '已生成', className: 'bg-status-success text-primary-foreground' },
  generation_failed: { label: '生成失败', className: 'bg-destructive text-destructive-foreground' },
  none: { label: '—', className: '' },
};

const MOCK_RECORDS: CurveRecord[] = [
  { id: '1', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-10', storageStatus: 'pending', pvPredictionStatus: null, adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: null, operator: null },
  { id: '2', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-09', storageStatus: 'sent', pvPredictionStatus: null, adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: '2026-03-08 08:00:00', operator: '王工' },
  { id: '3', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-07', storageStatus: 'sent', pvPredictionStatus: null, adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: '2026-03-06 08:00:00', operator: '系统' },
  { id: '4', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-10', storageStatus: 'pending', pvPredictionStatus: 'generated', adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: null, operator: null },
  { id: '5', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-09', storageStatus: 'sent', pvPredictionStatus: 'generated', adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: '2026-03-08 08:30:00', operator: '张工' },
  { id: '6', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-08', storageStatus: 'sent', pvPredictionStatus: 'generated', adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: '2026-03-07 08:00:00', operator: '系统' },
  { id: '7', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-06', storageStatus: 'failed', pvPredictionStatus: 'generation_failed', adjustableLoadStatus: null, nonAdjLoadPredictionStatus: null, lastSentOrGeneratedAt: '2026-03-05 08:00:00', operator: '系统' },
  { id: '8', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-10', storageStatus: 'pending', pvPredictionStatus: 'generated', adjustableLoadStatus: 'pending', nonAdjLoadPredictionStatus: 'generated', lastSentOrGeneratedAt: '2026-03-09 20:00:00', operator: '系统' },
  { id: '9', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-09', storageStatus: 'sent', pvPredictionStatus: 'generated', adjustableLoadStatus: 'sent', nonAdjLoadPredictionStatus: 'generated', lastSentOrGeneratedAt: '2026-03-08 09:15:00', operator: '李工' },
  { id: '10', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-07', storageStatus: 'failed', pvPredictionStatus: 'generated', adjustableLoadStatus: 'failed', nonAdjLoadPredictionStatus: 'generation_failed', lastSentOrGeneratedAt: '2026-03-06 09:15:00', operator: '李工' },
  { id: '11', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-05', storageStatus: 'sent', pvPredictionStatus: 'generated', adjustableLoadStatus: 'sent', nonAdjLoadPredictionStatus: 'generated', lastSentOrGeneratedAt: '2026-03-04 08:00:00', operator: '系统' },
];

const ALL_PROJECTS: ProjectInfo[] = [
  { name: '纯储能测试站', type: 'A', hasStorage: true, hasPv: false, hasAdjustableLoad: false, hasNonAdjustableLoad: false },
  { name: '示范储能电站一期', type: 'B', hasStorage: true, hasPv: true, hasAdjustableLoad: false, hasNonAdjustableLoad: false },
  { name: '朝6-605站', type: 'C', hasStorage: true, hasPv: true, hasAdjustableLoad: true, hasNonAdjustableLoad: true },
];

/** Dispatch status cell (储能计划 / 可调负荷计划) */
function DispatchStatusCell({ status }: { status: CurveStatus | null }) {
  if (status === null) return <span className="text-muted-foreground">—</span>;
  const cfg = DISPATCH_STATUS_BADGE[status];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

/** Prediction status cell (光伏预测 / 不可调负荷预测) */
function PredictionStatusCell({ status }: { status: PredictionStatus | null }) {
  if (status === null || status === 'none') return <span className="text-muted-foreground">—</span>;
  const cfg = PREDICTION_STATUS_BADGE[status];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

const CURVE_TYPE_LABELS: Record<string, string> = {
  storage: '储能计划',
  pv: '光伏预测',
  adjustableLoad: '可调负荷计划',
  nonAdjustableLoad: '不可调负荷预测',
};

function CurveTypeTags({ project }: { project: ProjectInfo }) {
  const types: string[] = [];
  if (project.hasStorage) types.push('storage');
  if (project.hasPv) types.push('pv');
  if (project.hasAdjustableLoad) types.push('adjustableLoad');
  if (project.hasNonAdjustableLoad) types.push('nonAdjustableLoad');
  return (
    <div className="flex flex-wrap gap-1">
      {types.map(t => (
        <Badge key={t} variant="secondary" className="text-xs font-normal">
          {CURVE_TYPE_LABELS[t]}
        </Badge>
      ))}
    </div>
  );
}

interface ProjectRow {
  project: ProjectInfo;
  latestRecord: CurveRecord | null;
  autoDispatch: boolean;
}

const Index = () => {
  const navigate = useNavigate();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [activeStrategyType, setActiveStrategyType] = useState<CurveTypeKey | null>(null);
  const [newCurveProject, setNewCurveProject] = useState('');
  const [projectFilterOpen, setProjectFilterOpen] = useState(false);
  const [autoDispatchMap, setAutoDispatchMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    ALL_PROJECTS.forEach(p => { map[p.name] = false; });
    return map;
  });

  const toggleProject = useCallback((name: string) => {
    setSelectedProjects(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  }, []);

  const toggleStrategyType = useCallback((type: CurveTypeKey) => {
    setActiveStrategyType(prev => prev === type ? null : type);
  }, []);

  const toggleAutoDispatch = useCallback((projectName: string) => {
    setAutoDispatchMap(prev => ({ ...prev, [projectName]: !prev[projectName] }));
  }, []);

  const strategyStats = useMemo((): StrategyStats[] => {
    const projectsWithStorage = ALL_PROJECTS.filter(p => p.hasStorage).length;
    const projectsWithPv = ALL_PROJECTS.filter(p => p.hasPv).length;
    const projectsWithAdjLoad = ALL_PROJECTS.filter(p => p.hasAdjustableLoad).length;
    const projectsWithNonAdjLoad = ALL_PROJECTS.filter(p => p.hasNonAdjustableLoad).length;

    // Dispatch status counts (storage, adjustableLoad)
    const countDispatch = (field: 'storageStatus' | 'adjustableLoadStatus', status: CurveStatus) =>
      MOCK_RECORDS.filter(r => r[field] === status).length;

    // Prediction status counts (pv, nonAdjLoad)
    const countPrediction = (field: 'pvPredictionStatus' | 'nonAdjLoadPredictionStatus', status: PredictionStatus) =>
      MOCK_RECORDS.filter(r => r[field] === status).length;

    return [
      {
        type: 'storage', label: '储能计划', icon: null, projectCount: projectsWithStorage,
        success: countDispatch('storageStatus', 'sent'),
        failed: countDispatch('storageStatus', 'failed'),
        pending: countDispatch('storageStatus', 'pending'),
        isPrediction: false,
      },
      {
        type: 'pv', label: '光伏预测', icon: null, projectCount: projectsWithPv,
        success: countPrediction('pvPredictionStatus', 'generated'),
        failed: countPrediction('pvPredictionStatus', 'generation_failed'),
        pending: 0,
        isPrediction: true,
      },
      {
        type: 'adjustableLoad', label: '可调负荷计划', icon: null, projectCount: projectsWithAdjLoad,
        success: countDispatch('adjustableLoadStatus', 'sent'),
        failed: countDispatch('adjustableLoadStatus', 'failed'),
        pending: countDispatch('adjustableLoadStatus', 'pending'),
        isPrediction: false,
      },
      {
        type: 'nonAdjustableLoad', label: '不可调负荷预测', icon: null, projectCount: projectsWithNonAdjLoad,
        success: countPrediction('nonAdjLoadPredictionStatus', 'generated'),
        failed: countPrediction('nonAdjLoadPredictionStatus', 'generation_failed'),
        pending: 0,
        isPrediction: true,
      },
    ];
  }, []);

  const projectRows = useMemo((): ProjectRow[] => {
    return ALL_PROJECTS
      .filter(p => selectedProjects.length === 0 || selectedProjects.includes(p.name))
      .filter(p => {
        if (!activeStrategyType) return true;
        if (activeStrategyType === 'storage') return p.hasStorage;
        if (activeStrategyType === 'pv') return p.hasPv;
        if (activeStrategyType === 'adjustableLoad') return p.hasAdjustableLoad;
        if (activeStrategyType === 'nonAdjustableLoad') return p.hasNonAdjustableLoad;
        return true;
      })
      .map(project => {
        const records = MOCK_RECORDS
          .filter(r => r.projectName === project.name)
          .sort((a, b) => b.curveDate.localeCompare(a.curveDate));
        return {
          project,
          latestRecord: records[0] ?? null,
          autoDispatch: autoDispatchMap[project.name] ?? false,
        };
      })
      .sort((a, b) => a.project.name.localeCompare(b.project.name));
  }, [selectedProjects, activeStrategyType, autoDispatchMap]);

  const handleNewCurve = () => {
    if (!newCurveProject) return;
    const proj = ALL_PROJECTS.find(p => p.name === newCurveProject);
    if (!proj) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const exists = MOCK_RECORDS.find(r => r.projectName === newCurveProject && r.curveDate === tomorrowStr);
    if (exists) {
      navigate(`/curve-detail?id=${exists.id}&edit=1`);
    } else {
      navigate(`/curve-detail?project=${encodeURIComponent(newCurveProject)}&type=${proj.type}&new=1`);
    }
  };

  const handleExport = () => {
    const ts = format(new Date(), 'yyyyMMddHHmmss');
    alert(`导出文件：调度曲线列表_${ts}.xlsx（演示）`);
  };

  const STRATEGY_LABELS: Record<CurveTypeKey, string> = {
    storage: '储能计划',
    pv: '光伏预测',
    adjustableLoad: '可调负荷计划',
    nonAdjustableLoad: '不可调负荷预测',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-panel-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">运行调控 · 调度曲线</h1>
      </div>

      <div className="p-6 space-y-6">
        <StrategySummaryCards
          stats={strategyStats}
          activeType={activeStrategyType}
          onToggle={toggleStrategyType}
        />

        {/* Filters + Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Popover open={projectFilterOpen} onOpenChange={setProjectFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-sm min-w-[160px] justify-start">
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                {selectedProjects.length === 0
                  ? '全部项目'
                  : `已选 ${selectedProjects.length} 个项目`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-2" align="start">
              <div className="space-y-1">
                {ALL_PROJECTS.map(p => (
                  <label key={p.name} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedProjects.includes(p.name)}
                      onCheckedChange={() => toggleProject(p.name)}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
              {selectedProjects.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => setSelectedProjects([])}>
                  清除筛选
                </Button>
              )}
            </PopoverContent>
          </Popover>

          {activeStrategyType && (
            <Badge variant="secondary" className="text-xs cursor-pointer" onClick={() => setActiveStrategyType(null)}>
              {STRATEGY_LABELS[activeStrategyType]} ✕
            </Badge>
          )}

          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-3.5 w-3.5" />
            导出
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                新增
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>新增调度曲线</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <p className="text-sm text-muted-foreground">选择项目后，将为该项目创建明日的调度曲线。</p>
                <Select value={newCurveProject} onValueChange={setNewCurveProject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_PROJECTS.map(p => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name}（{p.type === 'A' ? '纯储能' : p.type === 'B' ? '光储' : '光储荷'}）
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">取消</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleNewCurve} disabled={!newCurveProject}>确定</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Per-project table */}
        <div className="rounded-md border border-panel-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">项目名称</TableHead>
                <TableHead className="w-[200px]">曲线类型</TableHead>
                <TableHead className="w-[110px]">最近曲线日期</TableHead>
                <TableHead className="w-[80px]">储能计划</TableHead>
                <TableHead className="w-[80px]">光伏预测</TableHead>
                <TableHead className="w-[95px]">可调负荷计划</TableHead>
                <TableHead className="w-[100px]">不可调负荷预测</TableHead>
                <TableHead className="w-[145px]">最近下发/生成时间</TableHead>
                <TableHead className="w-[70px]">操作人</TableHead>
                <TableHead className="w-[90px]">
                  <Tooltip>
                    <TooltipTrigger className="cursor-help underline decoration-dotted decoration-muted-foreground">自动下发</TooltipTrigger>
                    <TooltipContent className="max-w-[200px] text-xs">仅针对最新可执行曲线（储能计划、可调负荷计划）自动下发</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="w-[70px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                projectRows.map(({ project, latestRecord, autoDispatch }) => (
                  <TableRow key={project.name}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell><CurveTypeTags project={project} /></TableCell>
                    <TableCell>{latestRecord?.curveDate ?? '—'}</TableCell>
                    <TableCell><DispatchStatusCell status={latestRecord?.storageStatus ?? null} /></TableCell>
                    <TableCell><PredictionStatusCell status={project.hasPv ? (latestRecord?.pvPredictionStatus ?? null) : null} /></TableCell>
                    <TableCell><DispatchStatusCell status={project.hasAdjustableLoad ? (latestRecord?.adjustableLoadStatus ?? null) : null} /></TableCell>
                    <TableCell><PredictionStatusCell status={project.hasNonAdjustableLoad ? (latestRecord?.nonAdjLoadPredictionStatus ?? null) : null} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{latestRecord?.lastSentOrGeneratedAt ?? '—'}</TableCell>
                    <TableCell>{latestRecord?.operator ?? '—'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={autoDispatch}
                        onCheckedChange={() => toggleAutoDispatch(project.name)}
                        disabled={!latestRecord}
                      />
                    </TableCell>
                    <TableCell>
                      {latestRecord ? (
                        <Link to={`/curve-detail?id=${latestRecord.id}`}>
                          <Button variant="link" size="sm" className="h-auto p-0">查看详情</Button>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Index;
