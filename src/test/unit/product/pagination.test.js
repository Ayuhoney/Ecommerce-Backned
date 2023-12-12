const {
    parseQueryParams,
    buildSearchQuery,
    pagination,
} = require('../../../controller/productController.js');

const mockProductModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
};

describe('parseQueryParams', () => {
    it('should parse query parameters correctly', () => {
        const query = {
            page: '2',
            limit: '10',
            search: 'test',
            sort: 'price',
            order: 'desc',
            category: 'Electronics',
        };

        const result = parseQueryParams(query);

        expect(result).toEqual({
            page: 1,
            limit: 10,
            search: 'test',
            sort: 'price',
            order: 'desc',
            categoryFilter: { category: { $in: ['Electronics'] } },
        });
    });
});



describe('pagination', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });


    it('should handle errors and throw an internal server error', async () => {
        const mockError = new Error('Database error');

        mockProductModel.find.mockRejectedValue(mockError);
        mockProductModel.countDocuments.mockRejectedValue(mockError);
        const query = {
            page: '2',
            limit: '10',
            search: 'test',
            sort: 'price',
            order: 'asc',
            category: 'Electronics',
        };

        await expect(() => pagination(query, mockProductModel)).rejects.toThrow('Internal Server Error');
    });
});
