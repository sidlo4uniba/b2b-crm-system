using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.FirmaAggregate.Commands.Firmy.CreateFirma;
using CRMBackend.Application.FirmaAggregate.Commands.Firmy.DeleteFirma;
using CRMBackend.Application.FirmaAggregate.Commands.Firmy.UpdateFirma;
using CRMBackend.Application.FirmaAggregate.Queries.GetFirma;
using CRMBackend.Application.FirmaAggregate.Queries.ListFirmy;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;
using CRMBackend.Domain.Entities;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FirmyController : ControllerBase
{
    private readonly ISender _sender;

    public FirmyController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] EntityFilter<Firma> filter,
        [FromQuery] EntitySort<Firma> sort,
        [FromQuery] EntityPage<Firma> page,
        [FromQuery] string? search)
    {
        var result = await _sender.Send(new ListFirmyQuery()
        {
            Filter = filter,
            Sort = sort,
            Page = page,
            Search = search
        });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _sender.Send(new GetFirmaQuery() { Id = id });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFirmaCommand command)
    {
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateFirmaCommand command)
    {
        if (command.Id != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _sender.Send(new DeleteFirmaCommand() { Id = id });
        return NoContent();
    }
}
