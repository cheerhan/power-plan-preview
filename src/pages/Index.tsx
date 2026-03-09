import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Download, Plus, Filter } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { CurveStatus, ProjectType } from '@/types/curve';
import { format } from 'date-fns';
import { StrategySummaryCards, CurveTypeKey, StrategyStats } from '@/components/list/StrategySummaryCards';

interface CurveRecord {
  id: string;
  projectName: string;
  projectType: ProjectType;
  curveDate: string;
  storageStatus: CurveStatus | null;
  pvStatus: CurveStatus | null;
  loadStatus: CurveStatus | null;
  lastSentAt: string | null;
  operator: string | null;
}

interface ProjectInfo {
  name: string;
  type: ProjectType;
  hasStorage: boolean;
  hasPv: boolean;
  hasLoad: boolean;
}

const STATUS_BADGE: Record<CurveStatus, { label: string; className: string }> = {
  sent: { label: '成功', className: 'bg-status-success text-primary-foreground' },
  pending: { label: '待下发', className: 'bg-status-pending text-primary-foreground' },
  failed: { label: '失败', className: 'bg-destructive text-destructive-foreground' },
};

const MOCK_RECORDS: CurveRecord[] = [
  { id: '1', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-10', storageStatus: 'pending', pvStatus: null, loadStatus: null, lastSentAt: null, operator: null },
  { id: '2', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-09', storageStatus: 'sent', pvStatus: null, loadStatus: null, lastSentAt: '2026-03-08 08:00:00', operator: '王工' },
  { id: '3', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-07', storageStatus: 'sent', pvStatus: null, loadStatus: null, lastSentAt: '2026-03-06 08:00:00', operator: '系统' },
  { id: '4', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-10', storageStatus: 'pending', pvStatus: 'pending', loadStatus: null, lastSentAt: null, operator: null },
  { id: '5', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-09', storageStatus: 'sent', pvStatus: 'sent', loadStatus: null, lastSentAt: '2026-03-08 08:30:00', operator: '张工' },
  { id: '6', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-08', storageStatus: 'sent', pvStatus: 'sent', loadStatus: null, lastSentAt: '2026-03-07 08:00:00', operator: '系统' },
  { id: '7', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-06', storageStatus: 'failed', pvStatus: 'failed', loadStatus: null, lastSentAt: '2026-03-05 08:00:00', operator: '系统' },
  { id: '8', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-10', storageStatus: 'pending', pvStatus: 'pending', loadStatus: 'pending', lastSentAt: null, operator: null },
  { id: '9', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-09', storageStatus: 'sent', pvStatus: 'sent', loadStatus: 'sent', lastSentAt: '2026-03-08 09:15:00', operator: '李工' },
  { id: '10', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-07', storageStatus: 'failed', pvStatus: 'failed', loadStatus: 'failed', lastSentAt: '2026-03-06 09:15:00', operator: '李工' },
  { id: '11', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-05', storageStatus: 'sent', pvStatus: 'sent', loadStatus: 'sent', lastSentAt: '2026-03-04 08:00:00', operator: '系统' },
];

const ALL_PROJECTS: ProjectInfo[] = [
  { name: '纯储能测试站', type: 'A', hasStorage: true, hasPv: false, hasLoad: false },
  { name: '示范储能电站一期', type: 'B', hasStorage: true, hasPv: true, hasLoad: false },
  { name: '朝6-605站', type: 'C', hasStorage: true, hasPv: true, hasLoad: true },
];

function StatusCell({ status }: { status: CurveStatus | null }) {
  if (status === null) return <span className="text-muted-foreground">—</span>;
  const cfg = STATUS_BADGE[status];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

const CURVE_TYPE_LABELS: Record<string, string> = {
  storage: '储能计划',
  pv: '光伏预测',
  load: '负荷计划',
};

function CurveTypeTags({ project }: { project: ProjectInfo }) {
  const types: string[] = [];
  if (project.hasStorage) types.push('storage');
  if (project.hasPv) types.push('pv');
  if (project.hasLoad) types.push('load');
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

  // Compute strategy stats
  const strategyStats = useMemo((): StrategyStats[] => {
    const projectsWithStorage = ALL_PROJECTS.filter(p => p.hasStorage).length;
    const projectsWithPv = ALL_PROJECTS.filter(p => p.hasPv).length;
    const projectsWithLoad = ALL_PROJECTS.filter(p => p.hasLoad).length;

    const count = (field: 'storageStatus' | 'pvStatus' | 'loadStatus', status: CurveStatus) =>
      MOCK_RECORDS.filter(r => r[field] === status).length;

    return [
      { type: 'storage', label: '储能计划', icon: null, projectCount: projectsWithStorage, success: count('storageStatus', 'sent'), failed: count('storageStatus', 'failed'), pending: count('storageStatus', 'pending') },
      { type: 'pv', label: '光伏预测', icon: null, projectCount: projectsWithPv, success: count('pvStatus', 'sent'), failed: count('pvStatus', 'failed'), pending: count('pvStatus', 'pending') },
      { type: 'load', label: '负荷计划', icon: null, projectCount: projectsWithLoad, success: count('loadStatus', 'sent'), failed: count('loadStatus', 'failed'), pending: count('loadStatus', 'pending') },
    ];
  }, []);

  // Build per-project rows with latest curve
  const projectRows = useMemo((): ProjectRow[] => {
    return ALL_PROJECTS
      .filter(p => selectedProjects.length === 0 || selectedProjects.includes(p.name))
      .filter(p => {
        if (!activeStrategyType) return true;
        if (activeStrategyType === 'storage') return p.hasStorage;
        if (activeStrategyType === 'pv') return p.hasPv;
        if (activeStrategyType === 'load') return p.hasLoad;
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-panel-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">运行调控 · 调度曲线</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Area 1: Strategy Summary Cards */}
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
              {activeStrategyType === 'storage' ? '储能计划' : activeStrategyType === 'pv' ? '光伏预测' : '负荷计划'} ✕
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

        {/* Area 2: Per-project table */}
        <div className="rounded-md border border-panel-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">项目名称</TableHead>
                <TableHead className="w-[180px]">曲线类型</TableHead>
                <TableHead className="w-[120px]">最近曲线日期</TableHead>
                <TableHead className="w-[90px]">储能计划</TableHead>
                <TableHead className="w-[90px]">光伏预测</TableHead>
                <TableHead className="w-[90px]">负荷计划</TableHead>
                <TableHead className="w-[160px]">最近下发时间</TableHead>
                <TableHead className="w-[80px]">操作人</TableHead>
                <TableHead className="w-[90px]">自动下发</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                projectRows.map(({ project, latestRecord, autoDispatch }) => (
                  <TableRow key={project.name}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell><CurveTypeTags project={project} /></TableCell>
                    <TableCell>{latestRecord?.curveDate ?? '—'}</TableCell>
                    <TableCell><StatusCell status={latestRecord?.storageStatus ?? null} /></TableCell>
                    <TableCell><StatusCell status={latestRecord?.pvStatus ?? null} /></TableCell>
                    <TableCell><StatusCell status={latestRecord?.loadStatus ?? null} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{latestRecord?.lastSentAt ?? '—'}</TableCell>
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
