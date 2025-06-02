using Ardalis.GuardClauses;
using AutoMapper;
using CRMBackend.Application.Common.DTOs.Invoices;
using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Application.Common.Interfaces.Services;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.DownloadCenovaPonuka;

public record DownloadCenovaPonukaQuery : IRequest<InvoiceFileResponse>
{
    public required int CenovaPonukaId { get; init; }
}

public class DownloadCenovaPonukaQueryHandler : IRequestHandler<DownloadCenovaPonukaQuery, InvoiceFileResponse>
{
    private readonly IReadRepository<CenovaPonuka> _cenovaPonukaRepository;
    private readonly IMapper _mapper;
    private readonly IInvoiceGeneratorService _invoiceGenerator;

    public DownloadCenovaPonukaQueryHandler(
        IReadRepository<CenovaPonuka> cenovaPonukaRepository,
        IMapper mapper,
        IInvoiceGeneratorService invoiceGenerator)
    {
        _cenovaPonukaRepository = cenovaPonukaRepository;
        _mapper = mapper;
        _invoiceGenerator = invoiceGenerator;
    }

    public async Task<InvoiceFileResponse> Handle(DownloadCenovaPonukaQuery request, CancellationToken cancellationToken)
    {
        var cenovaPonuka = await _cenovaPonukaRepository.GetQueryableNoTracking()
            .Where(cp => cp.Id == request.CenovaPonukaId)
            .Include(cp => cp.Objednavka)
                .ThenInclude(o => o.Firma)
                    .ThenInclude(f => f.Adresa)
            .Include(cp => cp.Objednavka)
                .ThenInclude(o => o.KontaktnaOsoba)
            .Include(cp => cp.Polozky)
                .ThenInclude(p => p.Tovar)
            .Include(cp => cp.Polozky)
                .ThenInclude(p => p.VariantTovar)
                    .ThenInclude(vt => vt != null ? vt.Velkost : null)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.CenovaPonukaId, cenovaPonuka);

        var invoiceData = _mapper.Map<InvoiceDTO>(cenovaPonuka);

        var pdfBytes = await _invoiceGenerator.GenerateInvoicePdfAsync(invoiceData);

        string invoiceNumber = $"{DateTime.Now.Year}-{cenovaPonuka.Id:D6}";
        return new InvoiceFileResponse(pdfBytes, invoiceNumber);
    }
} 
