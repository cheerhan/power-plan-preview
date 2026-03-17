import { ProjectParams, PROJECT_TYPE_LABELS } from '@/types/curve';

interface Props {
  params: ProjectParams;
}

function ParamRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-1.5 text-xs border-b border-panel-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function ProjectParamsCard({ params }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">项目基本参数</h3>
      <div className="rounded-md border border-panel-border bg-panel-bg px-3 py-1">
        <ParamRow label="项目类型" value={PROJECT_TYPE_LABELS[params.projectType]} />
        <ParamRow label="所属区域" value={params.region} />
        <ParamRow label="站点编号" value={params.stationCode} />
        <ParamRow label="储能额定功率" value={`${params.storageRatedPower} kW`} />
        <ParamRow label="储能额定容量" value={`${params.storageRatedCapacity} kWh`} />
        {params.pvInstalledCapacity !== undefined && (
          <ParamRow label="光伏装机容量" value={`${params.pvInstalledCapacity} kWp`} />
        )}
        {params.adjustableLoadCapacity !== undefined && (
          <ParamRow label="可调负荷容量" value={`${params.adjustableLoadCapacity} kW`} />
        )}
        {params.nonAdjustableLoadScale !== undefined && (
          <ParamRow label="不可调负荷规模" value={`${params.nonAdjustableLoadScale} kW`} />
        )}
      </div>
    </div>
  );
}
