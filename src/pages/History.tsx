
import { useState } from 'react';
import { History as HistoryIcon, Download, Calendar } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Types
interface ReportData {
  id: string;
  period: string;
  dateGenerated: string;
  totalAttacks: number;
  topAttackType: string;
}

// Generate mock reports data
const generateMockReports = (): ReportData[] => {
  const attackTypes = [
    'SQL Injection',
    'Port Scan',
    'Brute Force',
    'DDoS',
    'XSS Attack'
  ];
  
  const reports: ReportData[] = [];
  
  // Generate reports for the last 6 months
  const today = new Date();
  
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(today.getMonth() - i);
    
    const period = format(date, 'MMMM yyyy');
    const generatedDate = new Date(date);
    generatedDate.setDate(Math.min(28, today.getDate()));
    
    reports.push({
      id: `report-${date.getFullYear()}-${date.getMonth() + 1}`,
      period,
      dateGenerated: format(generatedDate, 'yyyy-MM-dd'),
      totalAttacks: Math.floor(Math.random() * 200) + 50,
      topAttackType: attackTypes[Math.floor(Math.random() * attackTypes.length)]
    });
  }
  
  return reports;
};

const History = () => {
  const [reports] = useState<ReportData[]>(generateMockReports());
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  // Handle report download
  const handleDownloadReport = (reportId: string) => {
    // In a real app, this would trigger an API call to generate and download the report
    toast({
      title: "Report download started",
      description: "Your report will download shortly."
    });
  };

  // Handle custom report generation
  const handleGenerateCustomReport = () => {
    if (!date) {
      toast({
        title: "No date selected",
        description: "Please select a date range for your custom report.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would trigger an API call to generate a custom report
    toast({
      title: "Custom report generation started",
      description: "Your report is being generated and will download when complete."
    });
  };

  return (
    <MainLayout title="History & Reports">
      <div className="flex items-center pb-4 gap-2">
        <HistoryIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">History & Reports</h2>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Custom Report</CardTitle>
            <CardDescription>
              Select a date range to generate a custom security report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="space-y-2 flex-1">
                <div className="text-sm font-medium">Select Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={handleGenerateCustomReport}
                className="mt-4 md:mt-8"
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              Download and view previously generated security reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Period</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Total Attacks</TableHead>
                  <TableHead>Top Attack Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.period}</TableCell>
                    <TableCell>{report.dateGenerated}</TableCell>
                    <TableCell>{report.totalAttacks}</TableCell>
                    <TableCell>{report.topAttackType}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default History;
