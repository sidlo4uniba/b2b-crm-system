using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.CreateVariantTovar;
using CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.DeleteVariantTovar;
using CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.UpdateVariantTovar;
using CRMBackend.Application.DodavatelAggregate.Commands.VariantyTovarov.UpdateVariantTovarAktivny;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/dodavatelia/{dodavatelId}/tovary/{tovarId}/varianty")]
public class VariantTovarController : ControllerBase
{
    private readonly ISender _sender;

    public VariantTovarController(ISender sender) => _sender = sender;

    [HttpPost]
    public async Task<IActionResult> Create(int dodavatelId, int tovarId, CreateVariantTovarCommand command)
    {
        if (command.TovarId != tovarId)
            return BadRequest("Route IDs do not match command IDs");
            
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPut("{variantId}")]
    public async Task<IActionResult> Update(int dodavatelId, int tovarId, int variantId, UpdateVariantTovarCommand command)
    {
        if (command.TovarId != tovarId || command.VariantId != variantId)
            return BadRequest("Route IDs do not match command IDs");
            
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{variantId}/aktivny")]
    public async Task<IActionResult> UpdateAktivny(int dodavatelId, int tovarId, int variantId, UpdateVariantTovarAktivnyCommand command)
    {
        if (command.TovarId != tovarId || command.VariantId != variantId)
            return BadRequest("Route IDs do not match command IDs");
            
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{variantId}")]
    public async Task<IActionResult> Delete(int dodavatelId, int tovarId, int variantId)
    {
        await _sender.Send(new DeleteVariantTovarCommand 
        { 
            TovarId = tovarId,
            VariantId = variantId
        });
        return NoContent();
    }
} 
