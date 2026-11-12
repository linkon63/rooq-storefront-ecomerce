import { SizeChartEditor } from "../_components/size-chart-editor";

export default async function EditSizeChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SizeChartEditor id={id} />;
}
