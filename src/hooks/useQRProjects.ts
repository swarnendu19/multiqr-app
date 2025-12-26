import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { QRProject, QRContent, QRDesign, QRType, defaultDesign } from '@/types/qr';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export function useQRProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<QRProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        headers: {
          'user-id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();

      const transformedData = (data || []).map((project: any) => ({
        id: project.id,
        user_id: project.user_id,
        name: project.name,
        qr_type: project.qr_type as QRType,
        content: (typeof project.content === 'string' ? JSON.parse(project.content) : project.content) as unknown as QRContent,
        design: (typeof project.design === 'string' ? JSON.parse(project.design) : project.design) as unknown as QRDesign,
        canvas_data: project.canvas_data ? (typeof project.canvas_data === 'string' ? JSON.parse(project.canvas_data) : project.canvas_data) : undefined,
        thumbnail_url: project.thumbnail_url || undefined,
        created_at: project.created_at || new Date().toISOString(),
        updated_at: project.updated_at || new Date().toISOString(),
      }));

      setProjects(transformedData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setLoading(false);
    }
  }, [user, fetchProjects]);

  const createProject = async (type: QRType, name?: string): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to create projects');
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify({
          name: name || `New ${type.toUpperCase()} QR`,
          qr_type: type,
          content: JSON.stringify({}), // Sending as string if backend expects string, or object if json
          design: JSON.stringify(defaultDesign),
          // If backend expects Json type (object), I should send object. 
          // But I reverted schema to String. So I must send string.
          // Wait, I reverted schema to String. So I MUST send stringified JSON.
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const data = await response.json();
      await fetchProjects();
      return data.id;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Pick<QRProject, 'name' | 'content' | 'design' | 'canvas_data' | 'thumbnail_url'>>
  ) => {
    if (!user) return false;

    try {
      console.log('useQRProjects: updateProject called with:', {
        id,
        updatesKeys: Object.keys(updates),
        thumbnailUrlType: typeof updates.thumbnail_url,
        thumbnailUrlLength: updates.thumbnail_url?.length
      });

      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      // Stringify if schema is String
      if (updates.content !== undefined) dbUpdates.content = JSON.stringify(updates.content);
      if (updates.design !== undefined) dbUpdates.design = JSON.stringify(updates.design);
      if (updates.canvas_data !== undefined) dbUpdates.canvas_data = JSON.stringify(updates.canvas_data);
      if (updates.thumbnail_url !== undefined) dbUpdates.thumbnail_url = updates.thumbnail_url;

      console.log('useQRProjects: dbUpdates to be sent:', Object.keys(dbUpdates));

      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify(dbUpdates),
      });

      if (!response.ok) throw new Error('Failed to update project');

      await fetchProjects();
      return true;
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast.error('Failed to save changes');
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return false;

    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'user-id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  };

  const duplicateProject = async (project: QRProject): Promise<string | null> => {
    if (!user) return null;

    try {
      const response = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify({
          name: `${project.name} (Copy)`,
          qr_type: project.qr_type,
          content: JSON.stringify(project.content),
          design: JSON.stringify(project.design),
          canvas_data: project.canvas_data ? JSON.stringify(project.canvas_data) : undefined,
          thumbnail_url: project.thumbnail_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to duplicate project');

      const data = await response.json();
      await fetchProjects();
      toast.success('Project duplicated');
      return data.id;
    } catch (error: any) {
      console.error('Error duplicating project:', error);
      toast.error('Failed to duplicate project');
      return null;
    }
  };

  const getProject = async (id: string): Promise<QRProject | null> => {
    if (!user) return null;
    try {
      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        headers: {
          'user-id': user.id,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch project');

      const data = await response.json();

      return {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        qr_type: data.qr_type as QRType,
        content: (typeof data.content === 'string' ? JSON.parse(data.content) : data.content) as unknown as QRContent,
        design: (typeof data.design === 'string' ? JSON.parse(data.design) : data.design) as unknown as QRDesign,
        canvas_data: data.canvas_data ? (typeof data.canvas_data === 'string' ? JSON.parse(data.canvas_data) : data.canvas_data) : undefined,
        thumbnail_url: data.thumbnail_url || undefined,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error fetching project:', error);
      return null;
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    getProject,
    refetch: fetchProjects,
  };
}
