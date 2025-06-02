using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.CreateKontaktnaOsoba;
using CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.DeleteKontaktnaOsoba;
using CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.UpdateKontaktnaOsoba;
using CRMBackend.Application.FirmaAggregate.Commands.KontaktneOsoby.UpdateKontaktnaOsobaAktivny;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/firmy/{firmaId}/kontaktne-osoby")]
public class KontaktneOsobyController : ControllerBase
{
    private readonly ISender _sender;

    public KontaktneOsobyController(ISender sender) => _sender = sender;

    [HttpPost]
    public async Task<IActionResult> Create(int firmaId, CreateKontaktnaOsobaCommand command)
    {
        if (command.FirmaId != firmaId) return BadRequest("Route ID does not match command ID");
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPut("{osobaId}")]
    public async Task<IActionResult> Update(int firmaId, int osobaId, UpdateKontaktnaOsobaCommand command)
    {
        if (command.FirmaId != firmaId || command.KontaktnaOsobaId != osobaId) 
            return BadRequest("Route ID does not match command ID");
        
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{osobaId}/aktivny")]
    public async Task<IActionResult> UpdateAktivny(int firmaId, int osobaId, UpdateKontaktnaOsobaAktivnyCommand command)
    {
        if (command.FirmaId != firmaId || command.KontaktnaOsobaId != osobaId) 
            return BadRequest("Route ID does not match command ID");
        
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{osobaId}")]
    public async Task<IActionResult> Delete(int firmaId, int osobaId)
    {
        await _sender.Send(new DeleteKontaktnaOsobaCommand 
        { 
            KontaktnaOsobaId = osobaId,
            FirmaId = firmaId
        });
        return NoContent();
    }
} 
