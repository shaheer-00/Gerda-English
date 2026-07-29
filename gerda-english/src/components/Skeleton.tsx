interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`skeleton-warm rounded-2xl ${className}`} />;
};

export default Skeleton;
