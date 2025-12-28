import { getPrisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, User, Type, Copy } from 'lucide-react';
import { QRContent } from '@/types/qr';

export default async function ViewQR({ params }: { params: { code: string } }) {
    const prisma = getPrisma();
    const project = await prisma.qRProject.findFirst({
        where: { short_code: params.code },
    });

    if (!project) {
        notFound();
    }

    const content = JSON.parse(project.content) as QRContent;
    const type = project.qr_type;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center border-b bg-white rounded-t-xl">
                    <CardTitle>{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {type === 'text' && (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Type className="h-6 w-6 text-primary" />
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-lg font-medium break-words">
                                {content.text}
                            </div>
                        </div>
                    )}

                    {type === 'wifi' && (
                        <div className="space-y-4">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Wifi className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Network Name</span>
                                    <span className="font-medium">{content.wifi?.ssid}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Password</span>
                                    <span className="font-medium font-mono">{content.wifi?.password}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Encryption</span>
                                    <span className="font-medium">{content.wifi?.encryption}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {type === 'vcard' && (
                        <div className="space-y-4">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold">{content.vcard?.firstName} {content.vcard?.lastName}</h3>
                                <p className="text-muted-foreground">{content.vcard?.title}</p>
                                <p className="text-sm text-muted-foreground">{content.vcard?.company}</p>
                            </div>
                            <div className="space-y-3 text-sm">
                                {content.vcard?.phone && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Phone</span>
                                        <a href={`tel:${content.vcard.phone}`} className="font-medium text-primary hover:underline">{content.vcard.phone}</a>
                                    </div>
                                )}
                                {content.vcard?.email && (
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-muted-foreground">Email</span>
                                        <a href={`mailto:${content.vcard.email}`} className="font-medium text-primary hover:underline">{content.vcard.email}</a>
                                    </div>
                                )}
                                {content.vcard?.website && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Website</span>
                                        <a href={content.vcard.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Visit</a>
                                    </div>
                                )}
                            </div>
                            <Button className="w-full mt-4">Save Contact</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
