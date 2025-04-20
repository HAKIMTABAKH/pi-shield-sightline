
import React from 'react';
import { Info, Github, Shield } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <MainLayout title="About">
      <div className="flex items-center pb-4 gap-2">
        <Info className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">About PiShield</h2>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PiShield IDS</CardTitle>
            <CardDescription>
              An open-source intrusion detection system for Raspberry Pi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
              <div className="flex flex-col items-center">
                <Shield className="h-16 w-16 text-primary mb-2" />
                <span className="text-xl font-semibold">PiShield v1.2.4</span>
              </div>
              <div className="max-w-xl text-center md:text-left">
                <p className="text-muted-foreground">
                  PiShield is a lightweight intrusion detection system designed specifically for the Raspberry Pi platform. 
                  It monitors your network traffic for suspicious activity and protects your home or small business network 
                  from potential threats.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Key Features</h3>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Real-time network traffic monitoring</li>
                <li>Automatic detection of common attack patterns</li>
                <li>IP-based blocking of malicious traffic</li>
                <li>Customizable alert thresholds and notification options</li>
                <li>Optimized performance for Raspberry Pi hardware</li>
                <li>Intuitive web dashboard for monitoring and configuration</li>
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Powered By</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-md p-4 text-center">
                  <span className="text-sm font-medium">Snort</span>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <span className="text-sm font-medium">Suricata</span>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <span className="text-sm font-medium">Node.js</span>
                </div>
                <div className="bg-muted rounded-md p-4 text-center">
                  <span className="text-sm font-medium">React</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>License & Acknowledgements</CardTitle>
            <CardDescription>
              Open-source attribution and project licensing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground">
                PiShield is licensed under the MIT License. See the LICENSE file for more details.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              <a 
                href="#" 
                className="text-primary hover:underline"
              >
                View Project on GitHub
              </a>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-2">Acknowledgements</h3>
              <p className="text-muted-foreground">
                PiShield builds upon the excellent work of many open-source projects. Special thanks to the
                developers and contributors of Snort, Suricata, and other security tools that make this project possible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default About;
