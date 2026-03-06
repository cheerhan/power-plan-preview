import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">曲线管理系统</h1>
        <p className="text-xl text-muted-foreground">单站点曲线详情页演示</p>
        <Link to="/curve-detail">
          <Button size="lg" className="mt-4">查看曲线详情</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
