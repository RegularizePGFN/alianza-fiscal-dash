import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Calendar, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Tooltip, Legend } from "recharts";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduledMessage {
  id: string;
  client_name: string;
  client_phone: string;
  message_text: string;
  scheduled_date: string;
  status: string;
  instance_name: string;
  user_id: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  requires_approval?: boolean;
  profiles?: {
    name: string;
    email: string;
  };
}

interface SchedulesDashboardProps {
  messages: ScheduledMessage[];
  loading: boolean;
}

export const SchedulesDashboard = ({ messages, loading }: SchedulesDashboardProps) => {
  // Calcular estatísticas gerais
  const stats = useMemo(() => {
    const total = messages.length;
    const sent = messages.filter(m => m.status === 'sent').length;
    const scheduled = messages.filter(m => m.status === 'pending').length;
    const failed = messages.filter(m => m.status === 'failed').length;
    
    return {
      total,
      sent,
      scheduled,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(1) : '0'
    };
  }, [messages]);

  // Dados por instância
  const instanceData = useMemo(() => {
    const instanceMap = new Map();
    
    messages.forEach(message => {
      const instance = message.instance_name;
      if (!instanceMap.has(instance)) {
        instanceMap.set(instance, {
          instance,
          total: 0,
          sent: 0,
          scheduled: 0,
          failed: 0
        });
      }
      
      const data = instanceMap.get(instance);
      data.total++;
      
      if (message.status === 'sent') data.sent++;
      else if (message.status === 'pending') data.scheduled++;
      else if (message.status === 'failed') data.failed++;
    });
    
    return Array.from(instanceMap.values());
  }, [messages]);

  // Dados por usuário
  const userData = useMemo(() => {
    const userMap = new Map();
    
    messages.forEach(message => {
      const userName = message.profiles?.name || 'Usuário Desconhecido';
      if (!userMap.has(userName)) {
        userMap.set(userName, {
          name: userName,
          total: 0,
          sent: 0,
          scheduled: 0,
          failed: 0
        });
      }
      
      const data = userMap.get(userName);
      data.total++;
      
      if (message.status === 'sent') data.sent++;
      else if (message.status === 'pending') data.scheduled++;
      else if (message.status === 'failed') data.failed++;
    });
    
    return Array.from(userMap.values());
  }, [messages]);

  // Dados por status para o gráfico de pizza
  const statusData = useMemo(() => [
    { name: 'Enviadas', value: stats.sent, color: 'hsl(var(--success))' },
    { name: 'Agendadas', value: stats.scheduled, color: 'hsl(var(--warning))' },
    { name: 'Falharam', value: stats.failed, color: 'hsl(var(--destructive))' }
  ].filter(item => item.value > 0), [stats]);

  // Dados de mensagens por dia da semana
  const weeklyData = useMemo(() => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyMap = new Map();
    
    weekDays.forEach((day, index) => {
      weeklyMap.set(index, { day, total: 0, sent: 0 });
    });
    
    messages.forEach(message => {
      const date = parseISO(message.scheduled_date);
      const dayOfWeek = date.getDay();
      const data = weeklyMap.get(dayOfWeek);
      if (data) {
        data.total++;
        if (message.status === 'sent') data.sent++;
      }
    });
    
    return Array.from(weeklyMap.values());
  }, [messages]);

  // Dados de mensagens por hora do dia
  const hourlyData = useMemo(() => {
    const hourlyMap = new Map();
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyMap.set(hour, { hour: `${hour}:00`, total: 0, sent: 0 });
    }
    
    messages.forEach(message => {
      const date = parseISO(message.scheduled_date);
      const hour = date.getHours();
      const data = hourlyMap.get(hour);
      if (data) {
        data.total++;
        if (message.status === 'sent') data.sent++;
      }
    });
    
    return Array.from(hourlyMap.values()).filter(item => item.total > 0);
  }, [messages]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total de Mensagens</h3>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <h3 className="text-sm font-medium">Enviadas</h3>
            </div>
            <p className="text-2xl font-bold text-success">{stats.sent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-medium">Agendadas</h3>
            </div>
            <p className="text-2xl font-bold text-warning">{stats.scheduled}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-medium">Taxa de Sucesso</h3>
            </div>
            <p className="text-2xl font-bold text-success">{stats.successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="instances">Por Instância</TabsTrigger>
          <TabsTrigger value="users">Por Usuário</TabsTrigger>
          <TabsTrigger value="timing">Horários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Proporção de mensagens por status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Mensagens por Dia da Semana</CardTitle>
                <CardDescription>Distribuição semanal dos agendamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" />
                    <Bar dataKey="sent" fill="hsl(var(--success))" name="Enviadas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens por Instância</CardTitle>
              <CardDescription>Performance de cada instância do WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={instanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="instance" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" />
                  <Bar dataKey="sent" fill="hsl(var(--success))" name="Enviadas" />
                  <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Falharam" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens por Usuário</CardTitle>
              <CardDescription>Performance de cada usuário</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Total" />
                  <Bar dataKey="sent" fill="hsl(var(--success))" name="Enviadas" />
                  <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Falharam" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens por Horário</CardTitle>
              <CardDescription>Distribuição de mensagens ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--primary))" 
                    name="Total" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sent" 
                    stroke="hsl(var(--success))" 
                    name="Enviadas" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};