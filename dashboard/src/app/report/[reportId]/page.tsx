interface ReportPageProps {
  params: { reportId: string };
}

export default function ReportPage({ params }: ReportPageProps) {
  return (
    <main>
      <h1>Report {params.reportId}</h1>
    </main>
  );
}
