using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.CreateDodavatel;
using CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.DeleteDodavatel;
using CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.UpdateDodavatel;
using CRMBackend.Application.DodavatelAggregate.Commands.Dodavatelia.UpdateDodavatelAktivny;
using CRMBackend.Application.DodavatelAggregate.Queries.GetDodavatel;
using CRMBackend.Application.DodavatelAggregate.Queries.ListDodavatelia;
using CRMBackend.Domain.AggregateRoots.DodavatelAggregate;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DodavateliaController : ControllerBase
{
    private readonly ISender _sender;

    public DodavateliaController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] EntityFilter<Dodavatel> filter,
        [FromQuery] EntitySort<Dodavatel> sort,
        [FromQuery] EntityPage<Dodavatel> page,
        [FromQuery] string? search)
    {
        var result = await _sender.Send(new ListDodavateliaQuery()
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
        var result = await _sender.Send(new GetDodavatelQuery() { Id = id });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateDodavatelCommand command)
    {
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateDodavatelCommand command)
    {
        if (command.Id != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/aktivny")]
    public async Task<IActionResult> UpdateAktivny(int id, UpdateDodavatelAktivnyCommand command)
    {
        if (command.Id != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _sender.Send(new DeleteDodavatelCommand() { Id = id });
        return NoContent();
    }
} 
