using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.KategorieProduktovAggregate.Commands.KategorieProduktov.CreateKategorieProduktov;
using CRMBackend.Application.KategorieProduktovAggregate.Commands.KategorieProduktov.DeleteKategorieProduktov;
using CRMBackend.Application.KategorieProduktovAggregate.Commands.KategorieProduktov.UpdateKategorieProduktov;
using CRMBackend.Application.KategorieProduktovAggregate.Queries.GetKategorieProduktov;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/kategorie-produktov")]
public class KategorieProduktovController : ControllerBase
{
    private readonly ISender _sender;

    public KategorieProduktovController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _sender.Send(new GetKategorieProduktovQuery());
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateKategorieProduktovCommand command)
    {
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateKategorieProduktovCommand command)
    {
        if (command.Id != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _sender.Send(new DeleteKategorieProduktovCommand() { Id = id });
        return NoContent();
    }
} 
