"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";

interface SchemaField {
  name: string;
  type: string;
  isOptional: boolean;
  isId: boolean;
  isUnique: boolean;
  defaultValue?: string;
  isRelation: boolean;
  relationTo?: string;
}

interface SchemaModel {
  name: string;
  fields: SchemaField[];
  comment?: string;
}

// Parse the Prisma schema to extract models and fields
const parseSchema = (schemaContent: string): SchemaModel[] => {
  const models: SchemaModel[] = [];
  const modelRegex = /(?:\/\/\/\s*(.*?)\n)?model\s+(\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = modelRegex.exec(schemaContent)) !== null) {
    const [, comment, modelName, modelBody] = match;
    if (!modelName || !modelBody) continue;
    
    const fields: SchemaField[] = [];
    
    // Parse fields within the model
    const fieldLines = modelBody.split('\n');
    for (const line of fieldLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('@@') || trimmedLine.startsWith('//')) {
        continue;
      }

      // Match field definition: fieldName Type? @decorator
      const fieldRegex = /(\w+)\s+([^\s@]+)(\?)?(.*)$/;
      const fieldMatch = fieldRegex.exec(trimmedLine);
      if (fieldMatch) {
        const [, fieldName, fieldType, optional, decorators] = fieldMatch;
        if (!fieldName || !fieldType) continue;
        
        const field: SchemaField = {
          name: fieldName,
          type: fieldType,
          isOptional: !!optional,
          isId: decorators?.includes('@id') ?? false,
          isUnique: decorators?.includes('@unique') ?? false,
          isRelation: false,
          defaultValue: extractDefault(decorators),
        };

        // Determine if it's a relation
        const relationRegex = /^([A-Z]\w+)(\[\])?$/;
        const relationMatch = relationRegex.exec(fieldType);
        if (relationMatch && !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json', 'Bytes'].includes(relationMatch[1]!)) {
          field.isRelation = true;
          field.relationTo = relationMatch[1];
        }

        fields.push(field);
      }
    }

    models.push({
      name: modelName,
      fields,
      comment: comment?.trim(),
    });
  }

  return models;
};

const extractDefault = (decorators?: string): string | undefined => {
  if (!decorators) return undefined;
  const defaultRegex = /@default\(([^)]+)\)/;
  const defaultMatch = defaultRegex.exec(decorators);
  return defaultMatch?.[1];
};

const getTypeIcon = (type: string, isRelation: boolean): string => {
  if (isRelation) return "🔗";
  
  switch (type.toLowerCase()) {
    case 'string': return "📝";
    case 'int': 
    case 'float': 
    case 'decimal': return "🔢";
    case 'boolean': return "✅";
    case 'datetime': return "📅";
    case 'json': return "📋";
    case 'bytes': return "📁";
    default: return "❓";
  }
};

const getTypeColor = (type: string, isRelation: boolean): string => {
  if (isRelation) return "text-purple-600 bg-purple-50";
  
  switch (type.toLowerCase()) {
    case 'string': return "text-green-600 bg-green-50";
    case 'int': 
    case 'float': 
    case 'decimal': return "text-blue-600 bg-blue-50";
    case 'boolean': return "text-yellow-600 bg-yellow-50";
    case 'datetime': return "text-red-600 bg-red-50";
    case 'json': return "text-indigo-600 bg-indigo-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

interface SchemaViewerProps {
  schemaContent?: string;
}

export function SchemaViewer({ schemaContent }: SchemaViewerProps) {
  const [models, setModels] = useState<SchemaModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchema = async () => {
      if (schemaContent) {
        setModels(parseSchema(schemaContent));
        setLoading(false);
        return;
      }

      try {
        // In a real app, you'd fetch this from an API endpoint
        // For now, we'll use the hardcoded schema content
        const defaultSchema = `
/// Lead submissions from the public contact form
model Lead {
  id          String    @id @default(cuid())
  createdAt   DateTime  @default(now())
  name        String
  email       String
  company     String?
  budget      String?
  goals       String?
  message     String
  source      String?
  handled     Boolean   @default(false)
  pagePath    String?
  referrer    String?
  submittedAt DateTime?
  userAgent   String?
  utmCampaign String?
  utmContent  String?
  utmMedium   String?
  utmSource   String?
  utmTerm     String?
}

model User {
  id            String         @id @default(cuid())
  name          String?
  email         String?        @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  accounts      Account[]
  apiTokens     ApiToken[]
  creditLedger  CreditLedger[]
  customers     Customer[]
  installations Installation[]
  posts         Post[]
  sessions      Session[]
  subscriptions Subscription[]
  usageEvents   UsageEvent[]
  appointments  Appointment[]
}

/// Service types for appointments
model Service {
  id           String        @id @default(cuid())
  name         String        @unique
  description  String?
  duration     Int           /// Duration in minutes
  price        Int?          /// Price in cents
  creditCost   Int?          /// Cost in credits
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  appointments Appointment[]
}

/// Customer appointment bookings
model Appointment {
  id          String   @id @default(cuid())
  userId      String
  serviceId   String
  timeSlotId  String?
  startTime   DateTime
  endTime     DateTime
  status      String   @default("scheduled") /// scheduled, confirmed, cancelled, completed, no_show
  notes       String?
  customerName String?
  customerEmail String?
  customerPhone String?
  reminderSent Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  service  Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  timeSlot TimeSlot? @relation(fields: [timeSlotId], references: [id])

  @@index([userId])
  @@index([startTime, endTime])
  @@index([status])
}
        `;
        
        setModels(parseSchema(defaultSchema));
      } catch (error) {
        console.error("Failed to load schema:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadSchema();
  }, [schemaContent]);

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.fields.some(field => field.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading database schema...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Overview */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Database Schema</h2>
            <p className="text-neutral-600">{models.length} models • Interactive schema explorer</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-500">Total Fields</div>
            <div className="text-2xl font-bold text-blue-600">
              {models.reduce((acc, model) => acc + model.fields.length, 0)}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search models and fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Model Quick Links */}
        <div className="flex flex-wrap gap-2">
          {models.map((model) => (
            <button
              key={model.name}
              onClick={() => setSelectedModel(selectedModel === model.name ? null : model.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedModel === model.name
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {model.name}
              <span className="ml-1 text-xs opacity-75">
                ({model.fields.length})
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Models Display */}
      <div className="grid gap-6">
        {filteredModels.map((model) => (
          <Card
            key={model.name}
            className={`overflow-hidden transition-all ${
              selectedModel && selectedModel !== model.name ? "opacity-50" : ""
            }`}
          >
            <div className="bg-neutral-50 px-6 py-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{model.name}</h3>
                  {model.comment && (
                    <p className="text-sm text-neutral-600 mt-1">{model.comment}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-500">Fields</div>
                  <div className="text-lg font-bold text-neutral-900">{model.fields.length}</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-3">
                {model.fields.map((field) => (
                  <div
                    key={field.name}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {getTypeIcon(field.type, field.isRelation)}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-neutral-900">
                            {field.name}
                          </span>
                          {field.isId && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                              ID
                            </span>
                          )}
                          {field.isUnique && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                              UNIQUE
                            </span>
                          )}
                          {field.isOptional && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                              OPTIONAL
                            </span>
                          )}
                        </div>
                        {field.isRelation && field.relationTo && (
                          <div className="text-xs text-purple-600 mt-1">
                            → Relates to {field.relationTo}
                          </div>
                        )}
                        {field.defaultValue && (
                          <div className="text-xs text-neutral-500 mt-1">
                            Default: {field.defaultValue}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(field.type, field.isRelation)}`}>
                        {field.isRelation ? field.relationTo : field.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-neutral-400 text-lg mb-2">🔍</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No matches found</h3>
          <p className="text-neutral-600">Try adjusting your search term.</p>
        </Card>
      )}
    </div>
  );
}
