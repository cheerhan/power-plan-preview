import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Download, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { CurveStatus, ProjectType } from '@/types/curve';

interface CurveRecord {
  id: string;
  projectName: string;
  projectType: ProjectType;
  curveDate: string;
  curveTypes: ('pv' | 'storage' | 'load')[];
  status: CurveStatus;
  lastSentAt: string | null;
  operator: string | null;
}

const CURVE_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  storage: { label: '储能计划', className: 'bg-chart-discharge text-foreground' },
  pv: { label: '光伏预测', className: 'bg-chart-pv/20 text-foreground' },
  load: { label: '负荷计划', className: 'bg-muted text-foreground' },
};

const STATUS_CONFIG: Record<CurveStatus, { label: string; variant: 'default' | 'secondary' | 'destructive'; className: string }> = {
  sent: { label: '成功', variant: 'default', className: 'bg-status-success' },
  pending: { label: '待下发', variant: 'secondary', className: 'bg-status-pending text-primary-foreground' },
  failed: { label: '失败', variant: 'destructive', className: '' },
};

const MOCK_RECORDS: CurveRecord[] = [
  // Project A: 纯储能
  { id: '1', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-10', curveTypes: ['storage'], status: 'pending', lastSentAt: null, operator: null },
  { id: '2', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-09', curveTypes: ['storage'], status: 'sent', lastSentAt: '2026-03-08 08:00:00', operator: '王工' },
  { id: '3', projectName: '纯储能测试站', projectType: 'A', curveDate: '2026-03-07', curveTypes: ['storage'], status: 'sent', lastSentAt: '2026-03-06 08:00:00', operator: '系统' },
  // Project B: 光储
  { id: '4', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-10', curveTypes: ['storage', 'pv'], status: 'pending', lastSentAt: null, operator: null },
  { id: '5', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-09', curveTypes: ['storage', 'pv'], status: 'sent', lastSentAt: '2026-03-08 08:30:00', operator: '张工' },
  { id: '6', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-08', curveTypes: ['storage', 'pv'], status: 'sent', lastSentAt: '2026-03-07 08:00:00', operator: '系统' },
  { id: '7', projectName: '示范储能电站一期', projectType: 'B', curveDate: '2026-03-06', curveTypes: ['storage', 'pv'], status: 'failed', lastSentAt: '2026-03-05 08:00:00', operator: '系统' },
  // Project C: 光储荷
  { id: '8', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-10', curveTypes: ['storage', 'pv', 'load'], status: 'pending', lastSentAt: null, operator: null },
  { id: '9', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-09', curveTypes: ['storage', 'pv', 'load'], status: 'sent', lastSentAt: '2026-03-08 09:15:00', operator: '李工' },
  { id: '10', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-07', curveTypes: ['storage', 'pv', 'load'], status: 'failed', lastSentAt: '2026-03-06 09:15:00', operator: '李工' },
  { id: '11', projectName: '朝6-605站', projectType: 'C', curveDate: '2026-03-05', curveTypes: ['storage', 'pv', 'load'], status: 'sent', lastSentAt: '2026-03-04 08:00:00', operator: '系统' },
];

const ALL_PROJECTS = [
  { name: '纯储能测试站', type: 'A' as ProjectType },
  { name: '示范储能电站一期', type: 'B' as ProjectType },
  { name: '朝6-605站', type: 'C' as ProjectType },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchProject, setSearchProject] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newCurveProject, setNewCurveProject] = useState('');

  const filtered = useMemo(() => {
    return MOCK_RECORDS
      .filter(r => !searchProject || r.projectName.includes(searchProject))
      .filter(r => statusFilter === 'all' || r.status === statusFilter)
      .sort((a, b) => b.curveDate.localeCompare(a.curveDate));
  }, [searchProject, statusFilter]);

  const handleNewCurve = () => {
    if (!newCurveProject) return;
    const proj = ALL_PROJECTS.find(p => p.name === newCurveProject);
    if (!proj) return;
    // Check if tomorrow's curve already exists
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-panel-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">运行调控 · 调度曲线</h1>
      </div>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索项目名称"
            value={searchProject}
            onChange={e => setSearchProject(e.target.value)}
            className="w-[200px] h-9 text-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9 text-sm">
              <SelectValue placeholder="下发状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="sent">成功</SelectItem>
              <SelectItem value="pending">待下发</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Button variant="outline" size="sm">
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

        {/* Table */}
        <div className="rounded-md border border-panel-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">项目名称</TableHead>
                <TableHead className="w-[120px]">曲线日期</TableHead>
                <TableHead className="w-[200px]">曲线类型</TableHead>
                <TableHead className="w-[80px]">下发状态</TableHead>
                <TableHead className="w-[180px]">最近下发时间</TableHead>
                <TableHead className="w-[100px]">操作人</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => {
                const sc = STATUS_CONFIG[r.status];
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.projectName}</TableCell>
                    <TableCell>{r.curveDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-1.5 flex-wrap">
                        {r.curveTypes.map(t => (
                          <Badge key={t} variant="secondary" className={`text-xs ${CURVE_TYPE_LABELS[t].className}`}>
                            {CURVE_TYPE_LABELS[t].label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sc.variant} className={sc.className}>
                        {sc.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.lastSentAt ?? '—'}</TableCell>
                    <TableCell>{r.operator ?? '—'}</TableCell>
                    <TableCell>
                      <Link to={`/curve-detail?id=${r.id}`}>
                        <Button variant="link" size="sm" className="h-auto p-0">查看详情</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Index;
