"""
Diamond Facet Runtime Server
Exposes 9 frozen facets as HTTP endpoints.

NO LOGIC IS ADDED. This is pure execution binding.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import sys
import os

# Add facet directories to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'AI Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Banking Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Government Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'TSA Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Defense Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Energy Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Insurance Facet'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Space X'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'Legal Facet'))

# Import facet evaluation functions
from diamond_ai_dock import evaluate_ai_deployment, AIRequest
from diamond_banking_dock import evaluate_banking_transaction, BankingRequest
from diamond_government_dock import evaluate_government_action, GovernmentRequest
from diamond_tsa_dock import evaluate_tsa_screening, TSARequest
from diamond_defense_dock import evaluate_defense_operation, DefenseRequest
from diamond_energy_dock import evaluate_energy_operation, EnergyRequest
from diamond_insurance_dock import evaluate_insurance_claim, InsuranceRequest
from diamond_spacex_dock import evaluate_aerospace_launch, AerospaceRequest
from diamond_legal_dock import evaluate_legal_matter, LegalRequest

app = FastAPI(
    title="Diamond Facet Runtime",
    version="1.0.0",
    description="Execution binding for 8 frozen facets"
)


class FacetRequest(BaseModel):
    """Generic facet evaluation request"""
    payload: Dict[str, Any]


class FacetResponse(BaseModel):
    """Generic facet evaluation response"""
    outcome: str
    request_id: str
    decision_timestamp: str
    decision_latency_ms: float
    reason: str
    gate_evaluations: Optional[list] = None


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "facet-runtime", "version": "1.0.0"}


@app.post("/facet/ai", response_model=FacetResponse)
async def evaluate_ai(request: FacetRequest):
    """AI Facet evaluation endpoint - executes existing frozen logic"""
    try:
        # Convert payload to AIRequest
        ai_request = AIRequest(**request.payload)
        
        # Execute frozen facet logic
        decision = evaluate_ai_deployment(ai_request)
        
        # Return decision
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/banking", response_model=FacetResponse)
async def evaluate_banking(request: FacetRequest):
    """Banking Facet evaluation endpoint - executes existing frozen logic"""
    try:
        banking_request = BankingRequest(**request.payload)
        decision = evaluate_banking_transaction(banking_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/government", response_model=FacetResponse)
async def evaluate_government(request: FacetRequest):
    """Government Facet evaluation endpoint - executes existing frozen logic"""
    try:
        gov_request = GovernmentRequest(**request.payload)
        decision = evaluate_government_action(gov_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/tsa", response_model=FacetResponse)
async def evaluate_tsa(request: FacetRequest):
    """TSA Facet evaluation endpoint - executes existing frozen logic"""
    try:
        tsa_request = TSARequest(**request.payload)
        decision = evaluate_tsa_screening(tsa_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/defense", response_model=FacetResponse)
async def evaluate_defense(request: FacetRequest):
    """Defense Facet evaluation endpoint - executes existing frozen logic"""
    try:
        defense_request = DefenseRequest(**request.payload)
        decision = evaluate_defense_operation(defense_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/energy", response_model=FacetResponse)
async def evaluate_energy(request: FacetRequest):
    """Energy Facet evaluation endpoint - executes existing frozen logic"""
    try:
        energy_request = EnergyRequest(**request.payload)
        decision = evaluate_energy_operation(energy_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/insurance", response_model=FacetResponse)
async def evaluate_insurance(request: FacetRequest):
    """Insurance Facet evaluation endpoint - executes existing frozen logic"""
    try:
        insurance_request = InsuranceRequest(**request.payload)
        decision = evaluate_insurance_claim(insurance_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/spacex", response_model=FacetResponse)
async def evaluate_spacex(request: FacetRequest):
    """SpaceX/Aerospace Facet evaluation endpoint - executes existing frozen logic"""
    try:
        spacex_request = AerospaceRequest(**request.payload)
        decision = evaluate_aerospace_launch(spacex_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/facet/legal", response_model=FacetResponse)
async def evaluate_legal(request: FacetRequest):
    """Legal Facet evaluation endpoint - executes existing frozen logic"""
    try:
        legal_request = LegalRequest(**request.payload)
        decision = evaluate_legal_matter(legal_request)
        
        return FacetResponse(
            outcome=decision.outcome.value,
            request_id=decision.request_id,
            decision_timestamp=decision.decision_timestamp.isoformat(),
            decision_latency_ms=decision.decision_latency_ms,
            reason=decision.reason,
            gate_evaluations=[
                {
                    "gate_name": g.gate_name,
                    "result": g.result.value,
                    "reason": g.reason,
                    "evaluated_at": g.evaluated_at.isoformat(),
                    "evidence": g.evidence
                }
                for g in decision.gate_evaluations
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler - all evaluation attempts are billable"""
    return JSONResponse(
        status_code=500,
        content={
            "outcome": "INVALID_INPUT",
            "reason": f"Facet runtime exception: {str(exc)}",
            "billable": True
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
