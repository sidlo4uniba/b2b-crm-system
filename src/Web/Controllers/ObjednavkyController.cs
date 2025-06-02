using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.CreateObjednavka;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.DeleteObjednavka;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.PatchObjednavka;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaFaza;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaNaplanovanyDatumVyroby;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaOcakavanyDatumDorucenia;
using CRMBackend.Application.ObjednavkaAggregate.Commands.Objednavky.UpdateObjednavkaChybaKlienta;
using CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.GetObjednavka;
using CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.ListObjednavky;
using CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.DownloadCenovaPonuka;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ObjednavkyController : ControllerBase
{
    private readonly ISender _sender;

    public ObjednavkyController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] EntityFilter<Objednavka> filter,
        [FromQuery] EntitySort<Objednavka> sort,
        [FromQuery] EntityPage<Objednavka> page,
        [FromQuery] string? search)
    {
        var result = await _sender.Send(new ListObjednavkyQuery()
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
        var result = await _sender.Send(new GetObjednavkaQuery() { Id = id });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateObjednavkaCommand command)
    {
        var entityId = await _sender.Send(command);
        return StatusCode(201, new { id = entityId });

    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, PatchObjednavkaCommand command)
    {
        if (command.ObjednavkaId != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/faza")]
    public async Task<IActionResult> UpdateFaza(int id, UpdateObjednavkaFazaCommand command)
    {
        if (command.ObjednavkaId != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/datum-vyroby")]
    public async Task<IActionResult> UpdateDatumVyroby(int id, UpdateObjednavkaNaplanovanyDatumVyrobyCommand command)
    {
        if (command.ObjednavkaId != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/ocakavany-datum-dorucenia")]
    public async Task<IActionResult> UpdateOcakavanyDatumDorucenia(int id, UpdateObjednavkaOcakavanyDatumDoruceniaCommand command)
    {
        if (command.ObjednavkaId != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpPut("{id}/chyba-klienta")]
    public async Task<IActionResult> UpdateChybaKlienta(int id, UpdateObjednavkaChybaKlientaCommand command)
    {
        if (command.ObjednavkaId != id) return BadRequest("Route ID does not match command ID");
        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _sender.Send(new DeleteObjednavkaCommand() { ObjednavkaId = id });
        return NoContent();
    }
} 
