using CRMBackend.Application.DodavatelAggregate.Commands.Tovary.CreateTovar;
using CRMBackend.Application.DodavatelAggregate.Commands.Tovary.DeleteTovar;
using CRMBackend.Application.DodavatelAggregate.Commands.Tovary.UpdateTovar;
using CRMBackend.Application.DodavatelAggregate.Commands.Tovary.UpdateTovarAktivny;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/dodavatelia/{dodavatelId}/tovary")]
public class DodavatelTovaryController : ControllerBase
{
    private readonly ISender _sender;

    public DodavatelTovaryController(ISender sender) => _sender = sender;

    [HttpPost]
    public async Task<IActionResult> Create(int dodavatelId, CreateTovarCommand command)
    {
        if (command.DodavatelId != dodavatelId) return BadRequest("Route dodavatelId does not match command dodavatelId");
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPut("{tovarId}")]
    public async Task<IActionResult> Update(int dodavatelId, int tovarId, UpdateTovarCommand command)
    {
        if (command.TovarId != tovarId) return BadRequest("Route tovarId does not match command Id");
        if (command.DodavatelId != dodavatelId) return BadRequest("Route dodavatelId does not match command dodavatelId");
        
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{tovarId}/aktivny")]
    public async Task<IActionResult> UpdateAktivny(int dodavatelId, int tovarId, UpdateTovarAktivnyCommand command)
    {
        if (command.TovarId != tovarId) return BadRequest("Route tovarId does not match command Id");
        if (command.DodavatelId != dodavatelId) return BadRequest("Route dodavatelId does not match command dodavatelId");
        
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{tovarId}")]
    public async Task<IActionResult> Delete(int dodavatelId, int tovarId)
    {
        var command = new DeleteTovarCommand
        {
            TovarId = tovarId,
            DodavatelId = dodavatelId
        };
        
        await _sender.Send(command);
        return NoContent();
    }
} 
