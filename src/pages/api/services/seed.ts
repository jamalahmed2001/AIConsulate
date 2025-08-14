import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";

const sampleServices = [
  {
    name: "AI Strategy Consultation",
    description: "Comprehensive strategy session to identify AI opportunities for your business, define implementation roadmap, and assess ROI potential.",
    duration: 60,
    price: 25000, // $250.00 in cents
    creditCost: 25,
    isActive: true,
  },
  {
    name: "Technical Architecture Review",
    description: "Deep dive into your current tech stack and infrastructure to design optimal AI integration points and technical requirements.",
    duration: 90,
    price: 35000, // $350.00 in cents
    creditCost: 35,
    isActive: true,
  },
  {
    name: "Quick AI Assessment",
    description: "Fast-track 30-minute session to evaluate your AI readiness and get immediate actionable recommendations.",
    duration: 30,
    price: 15000, // $150.00 in cents
    creditCost: 15,
    isActive: true,
  },
  {
    name: "Implementation Planning Session",
    description: "Detailed planning session to create step-by-step implementation timeline, resource allocation, and milestone definition.",
    duration: 75,
    price: 30000, // $300.00 in cents
    creditCost: 30,
    isActive: true,
  },
  {
    name: "AI Training Workshop",
    description: "Team training session covering AI fundamentals, best practices, and hands-on exercises tailored to your industry.",
    duration: 120,
    price: 50000, // $500.00 in cents
    creditCost: 50,
    isActive: true,
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if services already exist
    const existingServices = await db.service.findMany();
    
    if (existingServices.length > 0) {
      return res.status(200).json({ 
        message: "Services already exist", 
        count: existingServices.length 
      });
    }

    // Create sample services
    const createdServices = await Promise.all(
      sampleServices.map(service =>
        db.service.create({
          data: service
        })
      )
    );

    return res.status(201).json({ 
      message: "Sample services created successfully",
      services: createdServices
    });

  } catch (error) {
    console.error("Failed to seed services:", error);
    return res.status(500).json({ 
      error: "Failed to create sample services",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
