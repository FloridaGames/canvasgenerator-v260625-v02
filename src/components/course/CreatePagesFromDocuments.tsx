
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from 'lucide-react';
import { UploadedDocument } from '../CourseCreator';

interface CreatePagesFromDocumentsProps {
  documents: UploadedDocument[];
  onCreatePageFromDocument: (document: UploadedDocument) => void;
}

export const CreatePagesFromDocuments: React.FC<CreatePagesFromDocumentsProps> = ({
  documents,
  onCreatePageFromDocument
}) => {
  if (documents.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Pages from Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">{doc.name}</span>
              </div>
              <Button
                size="sm"
                onClick={() => onCreatePageFromDocument(doc)}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Page
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
