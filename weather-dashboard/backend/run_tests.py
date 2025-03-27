#!/usr/bin/env python3
"""
Test runner script to execute all backend tests
"""

import unittest
import sys
import os


def run_all_tests():
    """Run all tests in the tests directory"""
    # Ensure we can import modules from parent directory
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))

    # Discover and run all tests
    test_loader = unittest.TestLoader()
    test_suite = test_loader.discover('tests', pattern='test_*.py')

    # Run the tests
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)

    # Return appropriate exit code
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    sys.exit(run_all_tests())